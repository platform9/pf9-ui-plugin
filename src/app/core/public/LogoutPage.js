import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { trackEvent } from 'utils/tracking'
import { prop } from 'ramda'
import { sessionActions, sessionStoreKey } from 'core/session/sessionReducers'
import { cacheActions } from 'core/caching/cacheReducers'
import { notificationActions } from 'core/notifications/notificationReducers'
import Bugsnag from '@bugsnag/js'

// We are abusing the React component system a little bit here.  This is really
// nothing but an action but I didn't want to clutter the Navbar component with
// more code.  This gives us a nice clean separation.
const LogoutPage = () => {
  const dispatch = useDispatch()
  const session = useSelector(prop(sessionStoreKey))
  const { username } = session

  useEffect(() => {
    const metadata = {
      username,
      du_domain: window.location.origin,
    }
    Bugsnag.leaveBreadcrumb('PF9 Logged Out', metadata)
    trackEvent('PF9 Logged Out', metadata)

    dispatch(sessionActions.destroySession())
    dispatch(cacheActions.clearCache())
    dispatch(notificationActions.clearNotifications())
  }, [])

  return <div />
}

export default LogoutPage
