import React, { useEffect, useContext } from 'react'
import useReactRouter from 'use-react-router'
import { AppContext } from 'core/AppProvider'
import { clear } from 'core/utils/pf9Storage'
import { loginUrl } from 'app/constants'
import {
  invalidateLoadersCache, dataCacheKey, paramsCacheKey,
} from 'core/helpers/createContextLoader'
import { assoc, pipe } from 'ramda'
import { emptyArr } from 'utils/fp'

// We are abusing the React component system a little bit here.  This is really
// nothing but an action but I didn't want to clutter the Navbar component with
// more code.  This gives us a nice clean separation.
const LogoutPage = () => {
  const { history } = useReactRouter()
  const { destroySession, setContext } = useContext(AppContext)

  useEffect(() => {
    clear('user')
    clear('tokens')
    destroySession()
    invalidateLoadersCache()
    setContext(pipe(
      assoc(dataCacheKey, emptyArr),
      assoc(paramsCacheKey, emptyArr),
    ))
    history.push(loginUrl)
  }, [])

  return <div />
}

export default LogoutPage
