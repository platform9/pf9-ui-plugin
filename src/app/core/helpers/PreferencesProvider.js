import React from 'react'
import { withAppContext } from '../AppContext'
import { curry, pathOr, propOr } from 'ramda'
import { getStorage, setStorage } from '../common/pf9-storage'
import moize from 'moize'

const userPreferencesKey = username => `user-preferences-${username}`
const setUserPrefs = (username, prefs) => setStorage(userPreferencesKey(username), prefs)
const getStorageUserPrefs = username => getStorage(userPreferencesKey(username)) || {}

const Context = React.createContext({})
export const {Consumer} = Context
export const {Provider} = Context

class PreferencesProvider extends React.Component {
  state = {
    initUserPreferences: async username => {
      const userPrefs = getStorageUserPrefs(username)
      await this.props.updateSession('userPreferences', userPrefs)
      this.state.getScopedUserPreferences.clear()
      return userPrefs
    },

    getUserPreferences: () => {
      const {session} = this.props.context
      // Try to get preferences from session, otherwise get it from localStorage
      return propOr(
        getStorageUserPrefs(session.username),
        'userPreferences',
        session)
    },

    // Utility function that sets both context.session.userPreferences[key] and
    // also sets it in localStorage
    updateScopedUserPreferences: curry(async (scopeKey, values) => {
      const { getScopedUserPreferences } = this.state
      const prevValue = getScopedUserPreferences(scopeKey)
      const newValue = {...prevValue, ...values}

      // Update memoized values
      getScopedUserPreferences.update(scopeKey, newValue)

      // Update app context
      await this.props.updateSession(['userPreferences', scopeKey], newValue)

      // Update local storage
      const { username } = this.props.context.session
      const prefs = getStorageUserPrefs(username)
      prefs[scopeKey] = newValue
      setUserPrefs(username, prefs)
    }),

    getScopedUserPreferences: moize(key => {
      const {session} = this.props.context
      // Try to get preferences from session, otherwise get it from localStorage
      return pathOr(
        getStorageUserPrefs(session.username)[key],
        ['userPreferences', key],
        session) || {}
    }),
  }

  render () {
    return (
      <Provider value={this.state}>
        {this.props.children}
      </Provider>
    )
  }
}

export const withPreferences = Component => props =>
  <Consumer>
    {
      ({ initUserPreferences, getUserPreferences }) =>
        <Component
          {...props}
          preferences={getUserPreferences()}
          initUserPreferences={initUserPreferences}
        />
    }
  </Consumer>

export const withScopedPreferences = storeKey => Component => {
  return props =>
    <Consumer>
      {
        ({ updateScopedUserPreferences, getScopedUserPreferences }) =>
          <Component
            {...props}
            preferences={getScopedUserPreferences(storeKey)}
            updatePreferences={updateScopedUserPreferences(storeKey)}
          />
      }
    </Consumer>
}

export default withAppContext(PreferencesProvider)
