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
  async componentDidMount () {
    // Attempt to restore the session
    const username = getStorage('username')
    let unscopedToken = getStorage('unscopedToken')

    if (!username || !unscopedToken) {
      return this.props.history.push('/ui/openstack/login')
    }

    // We need to make sure the token has not expired.
    unscopedToken = await this.keystone.renewUnscopedToken(unscopedToken)

    if (!unscopedToken) {
      return this.props.history.push('/ui/openstack/login')
    }

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
    const { getUserPreferences, history, location } = this.props

    setStorage('username', username)
    setStorage('unscopedToken', unscopedToken)

    const prefs = getUserPreferences(username)
    prefs.lastTenant = prefs.lastTenant || 'service'

    this.setSession({
      unscopedToken,
      username,
      loginSuccessful: true,
      userPreferences: prefs,
    })

    if (location.pathname === '/ui/openstack/login') {
      history.push('/ui/openstack/dashboard')
    }
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
