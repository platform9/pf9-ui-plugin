import React, { PureComponent, SetStateAction } from 'react'
import {
  always, assoc, assocPath, Dictionary, flatten, lensProp, mergeLeft, over, prepend, take,
} from 'ramda'
import { dataCacheKey, paramsCacheKey } from 'core/helpers/createContextLoader'
import { emptyArr, pipe } from 'utils/fp'
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
  registerNotification: (
    title: string,
    message: string,
    type: 'warning' | 'error' | 'info',
  ) => Promise<void>
  clearNotifications: () => Promise<void>
}

const initialContext: IAppContext = {
  initialized: false,
  session: {},
  [dataCacheKey]: [],
  [paramsCacheKey]: [],
  notifications: [],
}

export const AppContext = React.createContext<IAppContext & Partial<IAppContextActions>>(
  initialContext,
)

const notifLens = lensProp('notifications')

class AppProvider extends PureComponent {
  state: IAppContext = initialContext
  initSession = async (unscopedToken: string, username: string, expiresAt: string) => {
    await this.setContext(
      assoc('session', {
        unscopedToken,
        username,
        expiresAt,
      }),
    )
  }

  updateSession = async (path, value) => {
    await this.setContext(assocPath(flatten(['session', path]), value))
  }

  destroySession = async () => {
    await this.setContext(
      mergeLeft({
        [dataCacheKey]: [],
        [paramsCacheKey]: [],
        notifications: [],
        session: {},
        currentTenant: null,
        userDetails: null,
      }),
    )
  }

  // Get an updated version of the current context
  getContext = (getterFn) => {
    // Return all values if no getterFn is specified
    return getterFn ? getterFn(this.state) : this.state
  }

  // We must add a trailing comma to the generic (<T, >) to sidestep the JSX ambiguity
  setContext = async <T, >(setterFn) => {
    return new Promise<T>((resolve) => {
      this.setState(setterFn, resolve)
    })
  }

  registerNotification = async (title, message, type) => {
    await this.setContext(
      over(
        notifLens,
        pipe(
          take(maxNotifications - 1),
          prepend({
            id: uuid.v4(),
            title,
            message,
            date: moment().format(),
            type,
          }),
        ),
      ),
    )
  }

  clearNotifications = async () => {
    await this.setContext(over(notifLens, always(emptyArr)))
  }

  render() {
    const context = this.state
    const actions: IAppContextActions = {
      getContext: this.getContext,
      setContext: this.setContext,
      initSession: this.initSession,
      updateSession: this.updateSession,
      destroySession: this.destroySession,
      registerNotification: this.registerNotification,
      clearNotifications: this.clearNotifications,
    }

    return (
      <AppContext.Provider value={{ ...context, ...actions }}>
        {this.props.children}
      </AppContext.Provider>
    )
  }
}

export const withAppContext = (Component) => (props) => (
  <AppContext.Consumer>{(context) => <Component {...props} {...context} />}</AppContext.Consumer>
)

export default AppProvider
