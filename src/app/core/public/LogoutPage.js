import React, { useEffect, useContext } from 'react'
import { AppContext } from 'core/providers/AppProvider'
import { clear } from 'core/utils/pf9Storage'
import { invalidateLoadersCache } from 'core/helpers/createContextLoader'

// We are abusing the React component system a little bit here.  This is really
// nothing but an action but I didn't want to clutter the Navbar component with
// more code.  This gives us a nice clean separation.
const LogoutPage = () => {
  const { destroySession } = useContext(AppContext)

  useEffect(() => {
    clear('user')
    clear('tokens')
    invalidateLoadersCache()
    destroySession()
  }, [])

  return <div />
}

export default LogoutPage
