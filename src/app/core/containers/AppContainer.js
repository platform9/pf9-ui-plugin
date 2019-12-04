import React, { useEffect, useContext } from 'react'
import ApiClient from 'api-client/ApiClient'
import { AppContext } from 'core/providers/AppProvider'
import { usePreferences, useScopedPreferences } from 'core/providers/PreferencesProvider'
import { setStorage, getStorage } from 'core/utils/pf9Storage'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { head, path, pathOr, propEq } from 'ramda'
import AuthenticatedContainer from 'core/containers/AuthenticatedContainer'
import track from 'utils/tracking'
import useReactRouter from 'use-react-router'
import { makeStyles } from '@material-ui/styles'
import { Route, Redirect, Switch } from 'react-router'
import { dashboardUrl, resetPasswordUrl, forgotPasswordUrl, loginUrl } from 'app/constants'
import ResetPasswordPage from 'core/public/ResetPasswordPage'
import ForgotPasswordPage from 'core/public/ForgotPasswordPage'
import { isNilOrEmpty } from 'utils/fp'
import LoginPage from 'core/public/LoginPage'
import Progress from 'core/components/progress/Progress'
import { getCookieValue } from 'utils/misc'

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
const AppContainer = props => {
  const classes = useStyles()
  const { keystone, setActiveRegion } = ApiClient.getInstance()
  const { history } = useReactRouter()
  const [, initUserPreferences] = usePreferences()
  const { updatePrefs } = useScopedPreferences('Tenants')
  const { initialized, session, appLoaded, getContext, setContext } = useContext(AppContext)

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      track('pageLoad', { route: `${location.pathname}${location.hash}` })
    })

    // This is to send page event for the first page the user lands on
    track('pageLoad', { route: `${history.location.pathname}${history.location.hash}` })

    restoreSession()

    return unlisten
  }, [])

  const restoreSession = async () => {
    // When trying to login with cookie with pmkft
    if (history.location.pathname === '/ui/pmkft/login') {
      const scopedToken = getCookieValue('X-Auth-Token')

      // Start from scratch to make use of prebuilt functions
      // for standard login page
      const { unscopedToken, username } = await keystone.getUnscopedTokenWithToken(scopedToken)
      if (!unscopedToken) {
        history.push(loginUrl)
        return
      }
      await setupSession({ username, unscopedToken })
      history.push(dashboardUrl)
      return
    }
    // Attempt to restore the session
    const tokens = getStorage('tokens')
    const user = getStorage('user') || {}
    const { name: username } = user
    let unscopedToken = tokens && tokens.unscopedToken
    if (username && unscopedToken) {
      // We need to make sure the token has not expired.
      unscopedToken = await keystone.renewToken(unscopedToken)
      if (unscopedToken && user) {
        return setupSession({ username, unscopedToken })
      }
    }
    await setContext({ appLoaded: true })
    history.push(loginUrl)
  }

  // Handler that gets invoked on successful authentication
  const setupSession = async ({ username, unscopedToken }) => {
    const { initSession } = getContext()

    await setContext({
      appLoaded: true,
      initialized: false
    })

    // Set up the scopedToken
    await initSession(unscopedToken, username)
    // The order matters, we need the session to be able to init the user preferences
    const userPreferences = await initUserPreferences(username)

    const lastTenant = pathOr('service', ['Tenants', 'lastTenant', 'name'], userPreferences)
    const lastRegion = path(['RegionChooser', 'lastRegion', 'id'], userPreferences)

    const tenants = await loadUserTenants({ getContext, setContext })
    const activeTenant = tenants.find(propEq('name', lastTenant)) || head(tenants)

    if (lastRegion) { setActiveRegion(lastRegion) }
    const { scopedToken, user, role } = await keystone.changeProjectScope(activeTenant.id)
    await keystone.resetCookie()

    /* eslint-disable */
    // Identify the user in Segment using Keystone ID
    if (typeof analytics !== 'undefined') {
      analytics.identify(user.id, {
        email: user.name,
      })
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
  }

  const loadingMessage = appLoaded
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
        {appLoaded && initialized
          ? authContent
          : <Progress renderLoadingImage={false} loading message={loadingMessage} />}
      </Route>
    </Switch>
  </div>
}

export default AppContainer
