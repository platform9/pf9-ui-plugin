import React, { useEffect } from 'react'
import { clear } from 'core/utils/pf9Storage'
import { useDispatch, useSelector } from 'react-redux'
import { sessionActions, sessionStoreKey } from 'core/session/sessionReducers'
import { cacheActions } from 'core/caching/cacheReducers'
import { trackEvent } from 'utils/tracking'
import { prop } from 'ramda'

// We are abusing the React component system a little bit here.  This is really
// nothing but an action but I didn't want to clutter the Navbar component with
// more code.  This gives us a nice clean separation.
const LogoutPage = () => {
  const dispatch = useDispatch()
  const session = useSelector(prop(sessionStoreKey))
  const { username } = session

  useEffect(() => {
    trackEvent('PF9 Logged Out', {
      username,
      du_domain: window.location.origin,
    })

    clear('user')
    clear('tokens')

    dispatch(sessionActions.destroySession())
    dispatch(cacheActions.clearCache())
  }, [])

  return <div />
}

export default LogoutPage
