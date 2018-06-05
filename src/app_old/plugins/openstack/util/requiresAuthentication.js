import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Session from '../actions/session'
const { restoreSession } = Session()

// import { getStorage } from '../../../core/common/pf9-storage'

// Wraps a component class to make it require authentication.
const requiresAuthentication = WrappedComponent => {
  const mapState = state => ({ session: state.openstack.session })

  return (
    @withRouter
    @connect(mapState)
    class AuthenticatedComponent extends React.Component {
      async componentDidMount () {
        const { session, history, dispatch } = this.props
        if (!(session && session.user)) {
          // Check first to see if there is a session we can recover from LocalStorage
          const restored = await dispatch(restoreSession)

          // Otherwise force the user to log in
          if (!restored) {
            history.push('/ui/openstack/login')
          }
        }
      }

      render () {
        // We need to delay rendering authenticated components until
        // authentication is completed.  Otherwise components will attempt
        // to make API calls (componentDidMount) before authentication / session
        // restore has the chance to finish.
        const { session } = this.props
        const shouldRender = session && session.user
        return shouldRender ? <WrappedComponent {...this.props} /> : null
      }
    }
  )
}

export default requiresAuthentication
