import React from 'react'
import moize from 'moize'
import { curry, pathOr, propOr } from 'ramda'
import { withAppContext } from '../AppContext'
import { getStorage, setStorage } from '../utils/pf9Storage'

const userPreferencesKey = username => `user-preferences-${username}`
const setUserPrefs = (username, prefs) => setStorage(userPreferencesKey(username), prefs)
const getStorageUserPrefs = username => getStorage(userPreferencesKey(username)) || {}

const Context = React.createContext({})
export const { Consumer: PreferencesConsumer } = Context
export const { Provider: PreferencesProvider } = Context

class PreferencesComponent extends React.Component {
  state = {
    initUserPreferences: async username => {
      const userPrefs = getStorageUserPrefs(username)
      await this.props.updateSession('userPreferences', userPrefs)
      this.state.getScopedUserPreferences.clear()
      return userPrefs
    },

    getUserPreferences: () => {
      const { session } = this.props.context
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
      const newValue = { ...prevValue, ...values }

      // Update memoized values
      getScopedUserPreferences.update([scopeKey], newValue)

      // Update app context
      await this.props.updateSession(['userPreferences', scopeKey], newValue)

      // Update local storage
      const { username } = this.props.context.session
      const prefs = getStorageUserPrefs(username)
      prefs[scopeKey] = newValue
      setUserPrefs(username, prefs)
    }),

    getScopedUserPreferences: moize(key => {
      const { session } = this.props.context
      // Try to get preferences from session, otherwise get it from localStorage
      return pathOr(
        getStorageUserPrefs(session.username)[key],
        ['userPreferences', key],
        session) || {}
    }),
  }

  render () {
    return (
      <PreferencesProvider value={this.state}>
        {this.props.children}
      </PreferencesProvider>
    )
  }
}

export const withPreferences = Component => props =>
  <PreferencesConsumer>
    {
      ({ initUserPreferences, getUserPreferences }) =>
        <Component
          {...props}
          preferences={getUserPreferences()}
          initUserPreferences={initUserPreferences}
        />
    }
  </PreferencesConsumer>

export const withScopedPreferences = storeKey => Component => {
  return props =>
    <PreferencesConsumer>
      {
        ({ updateScopedUserPreferences, getScopedUserPreferences }) =>
          <Component
            {...props}
            preferences={getScopedUserPreferences(storeKey)}
            updatePreferences={updateScopedUserPreferences(storeKey)}
          />
      }
    </PreferencesConsumer>
}

export default withAppContext(PreferencesComponent)
