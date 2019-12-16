import React, { useEffect, useState } from 'react'
import ApiClient from 'api-client/ApiClient'
import { useScopedPreferences } from 'core/providers/PreferencesProvider'
import { setStorage, getStorage } from 'core/utils/pf9Storage'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { head, path, pathOr, propEq, isEmpty, prop } from 'ramda'
import AuthenticatedContainer from 'core/containers/AuthenticatedContainer'
import track from 'utils/tracking'
import useReactRouter from 'use-react-router'
import { makeStyles } from '@material-ui/styles'
import { Route, Redirect, Switch } from 'react-router'
import {
  dashboardUrl,
  resetPasswordUrl,
  resetPasswordThroughEmailUrl,
  forgotPasswordUrl,
  loginUrl,
} from 'app/constants'
import ResetPasswordPage from 'core/public/ResetPasswordPage'
import ForgotPasswordPage from 'core/public/ForgotPasswordPage'
import { isNilOrEmpty } from 'utils/fp'
import LoginPage from 'core/public/LoginPage'
import Progress from 'core/components/progress/Progress'
import { getCookieValue } from 'utils/misc'
import moment from 'moment'
import { useToast } from 'core/providers/ToastProvider'
import { useSelector, useDispatch } from 'react-redux'
import { sessionStoreKey, sessionActions } from 'core/session/sessionReducers'
import { CustomWindow } from 'app/polyfills/window'
import { MessageTypes } from 'core/components/toasts/ToastItem'

declare let window: CustomWindow

const useStyles = makeStyles(theme => ({
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
  const classes = useStyles({})
  const { keystone, setActiveRegion } = ApiClient.getInstance()
  const { history } = useReactRouter()
  const showToast = useToast()
  const { prefs, updatePrefs } = useScopedPreferences('Tenants')
  const [sessionChecked, setSessionChecked] = useState(false)
  const [appInitialized, setAppInitialized] = useState(false)
  const session = useSelector(prop(sessionStoreKey))
  const dispatch = useDispatch()

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      track('pageLoad', { route: `${location.pathname}${location.hash}` })
    })

    // This is to send page event for the first page the user lands on
    track('pageLoad', { route: `${history.location.pathname}${history.location.hash}` })
    restoreSession()
    return unlisten
  }, [])

  useEffect(() => {
    if (!isEmpty(session)) {
      const id = setInterval(() => {
        // Check if session has expired
        const { expiresAt } = session
        const sessionExpired = moment().isAfter(expiresAt)
        if (sessionExpired) {
          dispatch(sessionActions.destroySession())
          showToast('The session has expired, please log in again', MessageTypes.warning)
          clearInterval(id)
        }
      }, 1000)
      // Reset the interval if the session changes
      return () => clearInterval(id)
    }
    return null
  }, [session])

  const restoreSession = async () => {
    // When trying to login with cookie with pmkft
    if (history.location.pathname === '/ui/pmkft/login') {
      const scopedToken = getCookieValue('X-Auth-Token')

      // Start from scratch to make use of prebuilt functions
      // for standard login page
      const { unscopedToken, username, expiresAt, issuedAt } = await keystone.getUnscopedTokenWithToken(scopedToken)
      if (!unscopedToken) {
        history.push(loginUrl)
        return
      }
      await setupSession({ username, unscopedToken, expiresAt, issuedAt })
      history.push(dashboardUrl)
      return
    }
    // Attempt to restore the session
    const tokens = getStorage('tokens')
    const user = getStorage('user') || {}
    const { name: username } = user
    const currUnscopedToken = tokens && tokens.unscopedToken
    if (username && currUnscopedToken) {
      // We need to make sure the token has not expired.
      const { unscopedToken, expiresAt, issuedAt } = await keystone.renewToken(currUnscopedToken)
      if (unscopedToken && user) {
        return setupSession({ username, unscopedToken, expiresAt, issuedAt })
      }
    }
    setSessionChecked(true)

    if (history.location.pathname === forgotPasswordUrl) return history.push(forgotPasswordUrl)

    // TODO: Need to fix this code after synching up with backend.
    if (history.location.hash.includes(resetPasswordThroughEmailUrl)) return history.push(history.location.hash.slice().replace('#', '/ui'))

    history.push(loginUrl)
  }

  // Handler that gets invoked on successful authentication
  const setupSession = async ({ username, unscopedToken, expiresAt, issuedAt }) => {
    if (!sessionChecked) {
      setSessionChecked(true)
    }

    const timeDiff = moment(expiresAt).diff(issuedAt)
    const localExpiresAt = moment().add(timeDiff).format()

    const lastTenant = pathOr('service', ['Tenants', 'lastTenant', 'name'], prefs)
    const lastRegion = path(['RegionChooser', 'lastRegion', 'id'], prefs)

    const tenants = await loadUserTenants()
    const activeTenant = tenants.find(propEq('name', lastTenant)) || head(tenants)

    if (lastRegion) {
      setActiveRegion(lastRegion)
    }
    const { scopedToken, user, role } = await keystone.changeProjectScope(activeTenant.id)
    await keystone.resetCookie()

    // Identify the user in Segment using Keystone ID
    if (typeof window.analytics !== 'undefined') {
      window.analytics.identify(user.id, {
        email: user.name,
      })
    }

    /* eslint-enable */
    updatePrefs({ lastTenant: activeTenant })
    setStorage('userTenants', tenants)
    setStorage('user', user)
    setStorage('tokens', { unscopedToken, currentToken: scopedToken })

    dispatch(sessionActions.initSession({
      unscopedToken,
      username,
      expiresAt: localExpiresAt,
      currentTenant: activeTenant,
      userDetails: { ...user, role },
    }))

    if (!appInitialized) {
      setAppInitialized(true)
    }
  }

  const loadingMessage = sessionChecked
    ? 'Initializing session...'
    : 'Loading app...'

  const authContent = isNilOrEmpty(session)
    ? <Redirect to={loginUrl} />
    : <AuthenticatedContainer />

  // Do not let the rest of the UI load until we have a working session.
  return <div className={classes.root} id="_main-container">
    <Switch>
      <Route path={resetPasswordUrl} component={ResetPasswordPage} />
      <Route path={forgotPasswordUrl} component={ForgotPasswordPage} />
      <Route path={loginUrl}>
        <LoginPage onAuthSuccess={setupSession} />
      </Route>
      <Route>
        {sessionChecked && appInitialized
          ? authContent
          : <Progress renderLoadingImage={false} loading message={loadingMessage} />}
      </Route>
    </Switch>
  </div>
}

export default AppContainer
