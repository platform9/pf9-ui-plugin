import React from 'react'
import { withRouter } from 'react-router'
import { compose } from 'app/utils/fp'
import { dashboardUrl, loginUrl } from 'app/constants'

import { withAppContext } from 'core/AppContext'
import { withPreferences } from 'core/providers/PreferencesProvider'
import { getStorage, setStorage } from 'core/utils/pf9Storage'
import LoginPage from 'openstack/components/LoginPage'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { pathOr } from 'ramda'

/**
 * Sets up the Openstack session.
 * Renders children when logged in.
 * Otherwise shows the <LoginPage>
 */
class SessionManager extends React.Component {
  async componentDidMount () {
    const { history, setContext } = this.props
    // Attempt to restore the session
    const tokens = getStorage('tokens')
    const user = getStorage('user')
    const username = user && user.username
    let unscopedToken = tokens && tokens.unscopedToken

    if (!username || !unscopedToken) {
      setContext({ initialized: true })
      return history.push(loginUrl)
    }

    // We need to make sure the token has not expired.
    unscopedToken = await this.keystone.renewToken(unscopedToken)

    if (!unscopedToken) {
      setContext({ initialized: true })
      return this.props.history.push(loginUrl)
    }

    this.initialSetup({ username, unscopedToken })
  }

  get keystone () { return this.props.context.apiClient.keystone }

  // Handler that gets invoked on successful authentication
  initialSetup = async ({ username, unscopedToken }) => {
    const { context, history, location, initSession, initUserPreferences, setContext } = this.props

    // Set up the scopedToken
    await initSession(unscopedToken, username)
    // The order matters, we need the session to be able to init the user preferences
    const userPreferences = await initUserPreferences(username)
    const lastTenant = pathOr('service', ['Tenants', 'lastTenant'], userPreferences)

    const tenants = await loadUserTenants({ context, setContext })
    const activeTenant = tenants.find(x => x.name === lastTenant)
    const { keystone } = context.apiClient
    const { scopedToken, user } = await keystone.changeProjectScope(activeTenant.id)

    setStorage('user', user)
    setStorage('tokens', { unscopedToken, currentToken: scopedToken })

    setContext({ initialized: true, sessionLoaded: true })

    if (location.pathname === loginUrl) {
      history.push(dashboardUrl)
    }
  }

  render () {
    const { context, children } = this.props
    const { initialized, session, sessionLoaded } = context

    if (!initialized) {
      return <div>Loading app...</div>
    }

    if (!session || !session.loginSuccessful) {
      return <LoginPage onAuthSuccess={this.initialSetup} />
    }

    // Do not let the rest of the UI load until we have a working session.
    return sessionLoaded ? children : <div>Initializing session...</div>
  }
}

export default compose(
  withAppContext,
  withPreferences,
  withRouter,
)(SessionManager)
