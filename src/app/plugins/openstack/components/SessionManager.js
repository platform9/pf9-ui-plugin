import React from 'react'
import { withAppContext } from 'core/AppContext'
import LoginPage from 'openstack/components/LoginPage'

// import { getStorage, setStorage, clear } from 'core/common/pf9-storage'

/**
 * Sets up the Openstack session.
 * Renders children when logged in.
 * Otherwise shows the <LoginPage>
 */
class SessionManager extends React.Component {
  componentDidMount () {
    // Attempt to restore the session
    /*
    const username = getStorage('username')
    const unscopedToken = getStorage('unscopedToken')
    if (!unscopedToken) { return }
    */
  }

  render () {
    const {
      context: { session },
      children
    } = this.props

    if (!session || !session.loginSuccessful) {
      return <LoginPage />
    }

    return children
  }
}

export default withAppContext(SessionManager)
