import React from 'react'
import { useSelector } from 'react-redux'
import { prop } from 'ramda'

// Wraps a component class to make it require authentication.
const requiresAuthentication = WrappedComponent => {
  return props => {
    const session = useSelector(prop('session'))
    const isAuthenticated = session && session.user

    // We need to delay rendering authenticated components until
    // authentication is completed.  Otherwise components will attempt
    // to make API calls (componentDidMount) before authentication / session
    // restore has the chance to finish.
    return isAuthenticated ? <WrappedComponent {...props} /> : null
  }
}

export default requiresAuthentication
