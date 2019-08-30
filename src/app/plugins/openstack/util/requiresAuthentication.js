import React from 'react'
import { compose } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'

// Wraps a component class to make it require authentication.
const requiresAuthentication = WrappedComponent => {
  return (
    compose(
      withAppContext,
    )(
      class AuthenticatedComponent extends React.PureComponent {
        isAuthenticated = () => {
          const { session } = this.props.context
          return session && session.user
        }

        render () {
          // We need to delay rendering authenticated components until
          // authentication is completed.  Otherwise components will attempt
          // to make API calls (componentDidMount) before authentication / session
          // restore has the chance to finish.
          return this.isAuthenticated ? <WrappedComponent {...this.props} /> : null
        }
      }
    )
  )
}

export default requiresAuthentication
