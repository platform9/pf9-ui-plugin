import React, { useEffect, useContext } from 'react'
import ApiClient from 'api-client/ApiClient'
import { AppContext } from 'core/providers/AppProvider'
import { usePreferences, useScopedPreferences } from 'core/providers/PreferencesProvider'
import { setStorage, getStorage } from 'core/utils/pf9Storage'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { head, path, pathOr, propEq, isEmpty, isNil } from 'ramda'
import AuthenticatedContainer from 'core/containers/AuthenticatedContainer'
import { trackPage, injectDrift } from 'utils/tracking'
import useReactRouter from 'use-react-router'
import { makeStyles } from '@material-ui/styles'
import { Route, Redirect, Switch } from 'react-router'
import {
  activateUserUrl,
  dashboardUrl,
  resetPasswordUrl,
  resetPasswordThroughEmailUrl,
  forgotPasswordUrl,
  loginUrl,
} from 'app/constants'
import ResetPasswordPage from 'core/public/ResetPasswordPage'
import ForgotPasswordPage from 'core/public/ForgotPasswordPage'
import ActivateUserPage from 'core/public/ActivateUserPage'
import { isNilOrEmpty, pathStrOr } from 'utils/fp'
import LoginPage from 'core/public/LoginPage'
import Progress from 'core/components/progress/Progress'
import { getCookieValue } from 'utils/misc'
import moment from 'moment'
import { useToast } from 'core/providers/ToastProvider'
import axios from 'axios'
import Bugsnag from '@bugsnag/js'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}))

/**
 * Sets up the Openstack session.
 * Renders children when logged in.
 * Otherwise shows the <LoginPage>
 */
const AppContainer = () => {
  const classes = useStyles()
  const { keystone, setActiveRegion } = ApiClient.getInstance()
  const { history } = useReactRouter()
  const showToast = useToast()
  const [, initUserPreferences] = usePreferences()
  const { updatePrefs } = useScopedPreferences('Tenants')
  const {
    initialized,
    initSession,
    session,
    appLoaded,
    destroySession,
    getContext,
    setContext,
    userDetails: { id: userId, name, displayName },
  } = useContext(AppContext)

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      trackPage(`${location.pathname}${location.hash}`)
    })

    // This is to send page event for the first page the user lands on
    trackPage(`${history.location.pathname}${history.location.hash}`)

    restoreSession()

    return unlisten
  }, [])

  useEffect(() => {
    Bugsnag.setUser(userId, name, displayName)
    if (!isEmpty(session)) {
      const id = setInterval(() => {
        // Check if session has expired
        const { expiresAt } = session
        const sessionExpired = moment().isAfter(expiresAt)
        if (sessionExpired) {
          destroySession()
          showToast('The session has expired, please log in again', 'warning')
          clearInterval(id)
        }
      }, 1000)
      // Reset the interval if the session changes
      return () => {
        Bugsnag.setUser()
        clearInterval(id)
      }
    }
  }, [session])

  const restoreSession = async () => {
    // When trying to login with cookie with pmkft
    if (history.location.pathname === '/ui/pmkft/login') {
      const urlParams = new URLSearchParams(history.location.search)
      const scopedToken = urlParams.get('token') || getCookieValue('X-Auth-Token')

      // Start from scratch to make use of prebuilt functions
      // for standard login page
      const {
        unscopedToken,
        username,
        expiresAt,
        issuedAt,
      } = await keystone.getUnscopedTokenWithToken(scopedToken)
      if (!unscopedToken) {
        history.push(loginUrl)
        return
      }
      const success = await setupSession({ username, unscopedToken, expiresAt, issuedAt })
      if (success) {
        history.push(dashboardUrl)
      }
      return
    }
    // Attempt to restore the session
    const tokens = getStorage('tokens')
    const user = getStorage('user') || {}
    const { name: username } = user
    const currUnscopedToken = tokens && tokens.unscopedToken
    if (username && currUnscopedToken) {
      // We need to make sure the token has not expired.
      const response = await keystone.renewToken(currUnscopedToken)

      if (isNil(response)) {
        return history.push(loginUrl)
      }

      const { unscopedToken, expiresAt, issuedAt } = response

      if (unscopedToken && user) {
        return setupSession({ username, unscopedToken, expiresAt, issuedAt })
      }
    }
    await setContext({ appLoaded: true })

    // Allow the following paths to load as entry point when user is not logged in
    if (history.location.pathname === forgotPasswordUrl) return

    if (history.location.pathname.includes(activateUserUrl)) return

    // TODO: Need to fix this code after synching up with backend.
    if (history.location.hash.includes(resetPasswordThroughEmailUrl)) {
      return history.push(history.location.hash.slice().replace('#', '/ui'))
    }

    if (history.location.pathname.includes(resetPasswordThroughEmailUrl)) return

    history.push(loginUrl)
  }

  // Handler that gets invoked on successful authentication
  const setupSession = async ({ username, unscopedToken, expiresAt, issuedAt }) => {
    await setContext({
      appLoaded: true,
      initialized: false,
    })

    const timeDiff = moment(expiresAt).diff(issuedAt)
    const localExpiresAt = moment()
      .add(timeDiff)
      .format()

    try {
      // Set up the scopedToken
      await initSession(unscopedToken, username, localExpiresAt)
      // The order matters, we need the session to be able to init the user preferences
      const userPreferences = await initUserPreferences(username)

      const lastTenant = pathOr('service', ['Tenants', 'lastTenant', 'name'], userPreferences)
      const lastRegion = path(['RegionChooser', 'lastRegion', 'id'], userPreferences)

      const tenants = await loadUserTenants({ getContext, setContext })
      if (isNilOrEmpty(tenants)) {
        throw new Error('No tenants found, please contact support')
      }
      const activeTenant = tenants.find(propEq('name', lastTenant)) || head(tenants)
      if (lastRegion) {
        setActiveRegion(lastRegion)
      }

      const { scopedToken, user, role } = await keystone.changeProjectScope(activeTenant.id)
      await keystone.resetCookie()
      /* eslint-disable */
      // Check for sandbox flag, if false identify the user in Segment using Keystone ID
      // This needs to be done here bc this needs to be done before login.
      // Features are requested again later for the specific logged-in region,
      // whereas this one is done on the master DU from which the UI is served.
      // Ignore exception if features.json not found (for local development)
      const features = await axios.get('/clarity/features.json').catch(() => null)
      const sandbox = pathStrOr(false, 'data.experimental.sandbox', features)

      if (!sandbox && typeof analytics !== 'undefined') {
        analytics.identify(user.id, {
          email: user.name,
        })
      }

      // Drift tracking code for live demo
      if (sandbox) {
        injectDrift()
      }

      /* eslint-enable */
      updatePrefs({ lastTenant: activeTenant })
      setStorage('userTenants', tenants)
      setStorage('user', user)
      setStorage('tokens', { unscopedToken, currentToken: scopedToken })

      await setContext({
        initialized: true,
        currentTenant: activeTenant,
        userDetails: { ...user, role },
      })
    } catch (err) {
      await setContext({
        appLoaded: false,
        initialized: false,
      })
      showToast(`There has been an error initializing the session.\n${err.message}`, 'error')
      return false
    }
    return true
  }

  const loadingMessage = appLoaded ? 'Initializing session...' : 'Loading app...'

  const authContent = isNilOrEmpty(session) ? (
    <Redirect to={loginUrl} />
  ) : (
    <AuthenticatedContainer />
  )

  // Do not let the rest of the UI load until we have a working session.
  return (
    <div className={classes.root} id="_main-container">
      <Switch>
        <Route path={resetPasswordUrl} component={ResetPasswordPage} />
        <Route path={forgotPasswordUrl} component={ForgotPasswordPage} />
        <Route path={activateUserUrl} component={ActivateUserPage} />
        <Route path={loginUrl}>
          <LoginPage onAuthSuccess={setupSession} />
        </Route>
        <Route>
          {appLoaded && initialized ? (
            authContent
          ) : (
            <Progress renderLoadingImage={false} loading message={loadingMessage} />
          )}
        </Route>
      </Switch>
    </div>
  )
}

export default AppContainer
