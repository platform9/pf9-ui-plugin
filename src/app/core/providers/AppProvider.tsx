import React, { SetStateAction, PureComponent } from 'react'
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
  always,
  pick,
  pipe
} from 'ramda'
import { dataCacheKey, paramsCacheKey } from 'core/helpers/createContextLoader'
import { emptyArr } from 'utils/fp'
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

const notifLens = lensProp('notifications')

const actionKeys: Array<keyof IAppContextActions> = [
  'initSession',
  'registerNotification',
  'clearNotifications',
  'updateSession',
  'destroySession',
  'getContext',
  'setContext',
]

const WindowObject = (window as any)

class AppProvider extends PureComponent {
  state: IAppContext = initialContext

  initSession = async (unscopedToken, username, expiresAt) => {
    return this.setContext(assoc('session', {
      unscopedToken,
      username,
      expiresAt,
    }))
  }

  registerNotification = async (title, message, type) => {
    await this.setContext(over(
      notifLens,
      pipe<Notification[], Notification[], Notification[]>(
        take(maxNotifications - 1),
        prepend({
          id: uuid.v4(),
          title,
          message,
          date: moment().format(),
          type
        })))
    )
  }

  clearNotifications = async () => {
    await this.setContext(over(notifLens, always(emptyArr)))
  }

  updateSession = async (path, value) => {
    return this.setContext(
      assocPath(flatten(['session', path]), value),
    )
  }

  destroySession = async () => {
    return this.setContext(mergeLeft({
      [dataCacheKey]: [],
      [paramsCacheKey]: [],
      notifications: [],
      session: {},
      currentTenant: null,
      userDetails: null,
    }))
  }

  // Get an updated version of the current context
  getContext = getterFn => {
    // Return all values if no getterFn is specified
    return getterFn ? getterFn(this.state) : this.state
  }

  setContext = async (setterFn, cb?) => {
    // If the `setState` async callback is not passed in default to
    // return a Promise.
    return new Promise((resolve, reject) => {
      if (cb) {
        return this.setState(setterFn, pipe(cb, resolve))
      }
      setImmediate(() => {
        WindowObject.context = this.state
      })
      this.setState(setterFn, resolve)
    })
  }

  componentDidMount () {
    // For debugging and development convenience
    WindowObject.context = this.state
    WindowObject.setContext = pick(actionKeys, this)
  }

  render () {
    return (
      <AppContext.Provider value={{ ...this.state, ...pick(actionKeys, this) }}>
        {this.props.children}
      </AppContext.Provider>
    )
  }
}

export const withAppContext = Component => props =>
  <AppContext.Consumer>{
    context => <Component {...props} {...context} />
  }</AppContext.Consumer>

export default AppProvider
