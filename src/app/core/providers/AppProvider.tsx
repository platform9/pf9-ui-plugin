import React, { useCallback, SetStateAction } from 'react'
import {
  assocPath,
  flatten,
  Dictionary,
  assoc,
  mergeLeft,
  lensProp,
  over,
  take,
  prepend,
  always
} from 'ramda'
import { dataCacheKey, paramsCacheKey } from 'core/helpers/createContextLoader'
import useStateAsync from 'core/hooks/useStateAsync'
import { pipe, emptyArr } from 'utils/fp'
import moment from 'moment'
import uuid from 'uuid'

const maxNotifications = 30

export interface Notification {
  id: string
  title: string
  message: string
  date: string
  type: 'warning' | 'error' | 'info'
}

interface IAppContext {
  initialized: boolean
  session: Dictionary<string>
  [dataCacheKey]: any[]
  [paramsCacheKey]: any[]
  notifications: Notification[]
  currentTenant?: string
  currentRegion?: string
  userDetails?: any
}

interface IAppContextActions {
  getContext: <T>(getter: (context: IAppContext) => T) => T
  setContext: <T>(setter: SetStateAction<IAppContext>) => Promise<IAppContext>
  initSession: (unscopedToken: string, username: string, expiresAt: string) => void
  updateSession: <T>(path: string, value: T) => void
  destroySession: () => void
  registerNotification: (title: string, message: string, type: 'warning' | 'error' | 'info') => Promise<void>
  clearNotifications: () => Promise<void>
}

const initialContext: IAppContext = {
  initialized: false,
  session: {},
  [dataCacheKey]: [],
  [paramsCacheKey]: [],
  notifications: []
}

export const AppContext = React.createContext<IAppContext & Partial<IAppContextActions>>(initialContext)

const AppProvider = ({ children }) => {
  const [context, setContextBase] = useStateAsync<IAppContext>(initialContext)

  const initSession = async (unscopedToken: string, username: string, expiresAt: string) => {
    await setContextBase(assoc('session', {
      unscopedToken,
      username,
      expiresAt,
    }))
  }

  const updateSession = async (path, value) => {
    await setContextBase(
      assocPath(flatten(['session', path]), value),
    )
  }

  const destroySession = async () => {
    await setContextBase(mergeLeft({
      [dataCacheKey]: [],
      [paramsCacheKey]: [],
      notifications: [],
      session: {},
      currentTenant: null,
      userDetails: null,
    }))
  }

  // Get an updated version of the current context
  const getContext = useCallback(getterFn => {
    // Return all values if no getterFn is specified
    return getterFn ? getterFn(context) : context
  }, [context])

  const setContext = useCallback(async setterFn => {
    return setContextBase(setterFn instanceof Function
      ? setterFn
      : context => ({ ...context, ...setterFn })
    )
  }, [])

  const notifLens = lensProp('notifications')
  const registerNotification = useCallback(async (title, message, type) => {
    await setContext(over(
      notifLens,
      pipe(
        take(maxNotifications - 1),
        prepend({
          id: uuid.v4(),
          title,
          message,
          date: moment().format(),
          type
        })))
    )
  }, [setContext])
  const clearNotifications = useCallback(async () => {
    await setContext(over(notifLens, always(emptyArr)))
  }, [setContext])

  const actions: IAppContextActions = {
    getContext,
    setContext,
    initSession,
    updateSession,
    destroySession,
    registerNotification,
    clearNotifications,
  }

  return (
    <AppContext.Provider value={{ ...context, ...actions }}>
      {children}
    </AppContext.Provider>
  )
}

export const withAppContext = Component => props =>
  <AppContext.Consumer>{
    context => <Component {...props} {...context} />
  }</AppContext.Consumer>

export default AppProvider
