import React, { useCallback, SetStateAction } from 'react'
import { assocPath, flatten, Dictionary, assoc, mergeLeft } from 'ramda'
import { dataCacheKey, paramsCacheKey } from 'core/helpers/createContextLoader'
import useStateAsync from 'core/hooks/useStateAsync'

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
  initSession: (unscopedToken: string, username: string) => void
  updateSession: <T>(path: string, value: T) => void
  destroySession: () => void
}

const initialContext: IAppContext = {
  initialized: false,
  session: {},
  [dataCacheKey]: [],
  [paramsCacheKey]: [],
  notifications: []
}

export const AppContext = React.createContext<IAppContext & IAppContextActions>({
  ...initialContext,
  getContext: () => null,
  setContext: () => null,
  initSession: () => null,
  updateSession: () => null,
  destroySession: () => null,
})

const AppProvider = ({ children }) => {
  const [context, setContextBase] = useStateAsync<IAppContext>(initialContext)
  const initSession = async (unscopedToken: string, username: string) => {
    await setContextBase(assoc('session', {
      unscopedToken,
      username,
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
  }, [context, setContextBase])

  return (
    <AppContext.Provider value={{
      ...context,
      getContext,
      setContext,
      initSession,
      updateSession,
      destroySession,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const withAppContext = Component => props =>
  <AppContext.Consumer>{
    context => <Component {...props} {...context} />
  }</AppContext.Consumer>

export default AppProvider
