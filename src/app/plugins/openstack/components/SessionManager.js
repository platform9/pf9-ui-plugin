import React from 'react'
import { withRouter } from 'react-router'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import LoginPage from 'openstack/components/LoginPage'

import { getStorage, setStorage } from 'core/common/pf9-storage'

/**
 * Sets up the Openstack session.
 * Renders children when logged in.
 * Otherwise shows the <LoginPage>
 */
class SessionManager extends React.Component {
  componentDidMount () {
    // Attempt to restore the session
    const username = getStorage('username')
    const unscopedToken = getStorage('unscopedToken')
    if (!unscopedToken || !username) { return }
    this.initialSetup({ username, unscopedToken })
  }

  get keystone () { return this.props.context.openstackClient.keystone }
  setSession (newState = {}) {
    this.props.setContext(state => ({
      ...state,
      session: {
        ...state.session,
        ...newState
      }
    }))
  }

  // Handler that gets invoked on successful authentication
  initialSetup = ({ username, unscopedToken }) => {
    const { history } = this.props
    setStorage('username', username)
    setStorage('unscopedToken', unscopedToken)
    const lastTenant = getStorage(`last-tenant-accessed-${username}`) || 'service'
    const lastRegion = getStorage(`last-region-accessed-${username}`)
    const userPreferences = getStorage(`user-preference-${username}`) || {}

    this.setSession({
      unscopedToken,
      username,
      loginSuccessful: true,
      lastTenant,
      lastRegion,
      userPreferences,
    })

    history.push('/')
  }

  render () {
    const { context, children } = this.props
    const { session } = context

    if (!session || !session.loginSuccessful) {
      return <LoginPage onAuthSuccess={this.initialSetup} />
    }

    return children
  }
}

export default compose(
  withAppContext,
  withRouter,
)(SessionManager)
