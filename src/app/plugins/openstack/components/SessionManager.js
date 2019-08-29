import React, { useEffect, useContext } from 'react'
import ApiClient from 'api-client/ApiClient'
import { withRouter } from 'react-router'
import { compose } from 'app/utils/fp'
import { dashboardUrl, loginUrl } from 'app/constants'
import { AppContext } from 'core/AppProvider'
import { withPreferences, usePreferences } from 'core/providers/PreferencesProvider'
import { getStorage, setStorage } from 'core/utils/pf9Storage'
import LoginPage from 'openstack/components/LoginPage'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { path, pathOr, propEq } from 'ramda'

/**
 * Sets up the Openstack session.
 * Renders children when logged in.
 * Otherwise shows the <LoginPage>
 */
const SessionManager = props => {
  const { keystone, setActiveRegion } = ApiClient.getInstance()
  const [ , initUserPreferences ] = usePreferences()
  const { getContext, setContext, currentRegion } = useContext(AppContext)
  const { initialized, session, sessionLoaded } = getContext()

  useEffect(() => {
    init()
  }, [currentRegion])

  const init = async () => {
    // Attempt to restore the session
    const tokens = getStorage('tokens')
    const user = getStorage('user')
    const { history } = props
    const username = user && user.username
    let unscopedToken = tokens && tokens.unscopedToken

    if (!username || !unscopedToken) {
      setContext({ initialized: true })
      history.push(loginUrl)
    } else {
      // We need to make sure the token has not expired.
      unscopedToken = await keystone.renewToken(unscopedToken)

      if (!unscopedToken) {
        setContext({ initialized: true })
        history.push(loginUrl)
      } else {
        await initialSetup({ username, unscopedToken })
      }
    }
  }

  // Handler that gets invoked on successful authentication
  const initialSetup = async ({ username, unscopedToken }) => {
    const { initSession } = getContext()
    const { history, location } = props

    // Set up the scopedToken
    await initSession(unscopedToken, username)
    // The order matters, we need the session to be able to init the user preferences
    const userPreferences = await initUserPreferences(username)

    const lastTenant = pathOr('service', ['Tenants', 'lastTenant', 'name'], userPreferences)
    const lastRegion = path(['RegionChooser', 'lastRegion', 'id'], userPreferences)

    const tenants = await loadUserTenants({ getContext, setContext })
    const activeTenant = tenants.find(propEq('name', lastTenant))

    if (lastRegion) { setActiveRegion(lastRegion) }
    const { scopedToken, user } = await keystone.changeProjectScope(activeTenant.id)

    setStorage('user', user)
    setStorage('tokens', { unscopedToken, currentToken: scopedToken })

    setContext({
      initialized: true,
      sessionLoaded: true,
      currentTenant: activeTenant,
    })

    if (location.pathname === loginUrl) {
      history.push(dashboardUrl)
    }
  }

  if (!initialized) {
    return <div>Loading app...</div>
  }

  if (!session || !session.loginSuccessful) {
    return <LoginPage onAuthSuccess={initialSetup} />
  }

  // Do not let the rest of the UI load until we have a working session.
  return sessionLoaded ? props.children : <div>Initializing session...</div>
}

export default compose(
  withPreferences,
  withRouter,
)(SessionManager)
