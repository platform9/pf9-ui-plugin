import React, { useEffect } from 'react'
import { clear } from 'core/utils/pf9Storage'
import { useDispatch } from 'react-redux'
import { sessionActions } from 'core/session/sessionReducers'
import { cacheActions } from 'core/caching/cacheReducers'

// We are abusing the React component system a little bit here.  This is really
// nothing but an action but I didn't want to clutter the Navbar component with
// more code.  This gives us a nice clean separation.
const LogoutPage = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    clear('user')
    clear('tokens')

    dispatch(sessionActions.destroySession())
    dispatch(cacheActions.clearCache())
  }, [])

  return <div />
}

export default LogoutPage
