import React from 'react'
import { withRouter } from 'react-router'
import { compose } from 'core/../../../utils/fp'
import { withAppContext } from 'core/AppContext'
import LoginPage from 'openstack/components/LoginPage'

import { getStorage, setStorage } from 'core/util/pf9-storage'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { withPreferences } from 'core/PreferencesProvider'
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
    const username = getStorage('username')
    let unscopedToken = getStorage('unscopedToken')

    if (!username || !unscopedToken) {
      setContext({ initialized: true })
      return history.push('/ui/openstack/login')
    }

    // We need to make sure the token has not expired.
    unscopedToken = await this.keystone.renewToken(unscopedToken)

    if (!unscopedToken) {
      setContext({ initialized: true })
      return this.props.history.push('/ui/openstack/login')
    }

    this.initialSetup({ username, unscopedToken })
  }

  get keystone () { return this.props.context.apiClient.keystone }

  // Handler that gets invoked on successful authentication
  initialSetup = async ({ username, unscopedToken }) => {
    const { context, history, location, initSession, initUserPreferences, setContext } = this.props

    setStorage('username', username)
    setStorage('unscopedToken', unscopedToken)

    // Set up the scopedToken
    await initSession(unscopedToken, username)
    // The order matters, we need the session to be able to init the user preferences
    const userPreferences = await initUserPreferences(username)
    const lastTenant = pathOr('service', ['Tenants', 'lastTenant'], userPreferences)

    const tenants = await loadUserTenants({ context, setContext })
    const activeTenant = tenants.find(x => x.name === lastTenant)
    const { keystone } = context.apiClient
    await keystone.changeProjectScope(activeTenant.id)

    setContext({ initialized: true })

    if (location.pathname === '/ui/openstack/login') {
      history.push('/ui/openstack/dashboard')
    }
  }

  render () {
    const { context, children } = this.props
    const { session, initialized } = context

    if (!initialized) {
      return <div>Loading app...</div>
    }

    if (!session || !session.loginSuccessful) {
      return <LoginPage onAuthSuccess={this.initialSetup} />
    }

    return children
  }
}

export default compose(
  withAppContext,
  withPreferences,
  withRouter,
)(SessionManager)
