import React, { useContext, useCallback, PureComponent, useMemo } from 'react'
import moize from 'moize'
import { equals, curry, pathOr, propOr, zipObj } from 'ramda'
import { withAppContext, AppContext } from 'core/providers/AppProvider'
import { getStorage, setStorage } from '../utils/pf9Storage'
import { emptyObj } from 'utils/fp'

const userPreferencesKey = username => `user-preferences-${username}`
const setUserPrefs = (username, prefs) => setStorage(userPreferencesKey(username), prefs)
const getStorageUserPrefs = username => getStorage(userPreferencesKey(username)) || {}

export const PreferencesContext = React.createContext({})
export const { Consumer: PreferencesConsumer } = PreferencesContext
export const { Provider: PreferencesProvider } = PreferencesContext

class PreferencesComponent extends PureComponent {
  state = {
    initUserPreferences: async username => {
      const userPrefs = getStorageUserPrefs(username)
      await this.props.updateSession('userPreferences', userPrefs)
      this.state.getScopedUserPreferences.clear()
      return userPrefs
    },

    getUserPreferences: () => {
      const { session } = this.props
      // Try to get preferences from session, otherwise get it from localStorage
      return propOr(
        getStorageUserPrefs(session.username),
        'userPreferences',
        session)
    },

    // Utility function that sets both session.userPreferences[key] and
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
      const { username } = this.props.session
      const prefs = getStorageUserPrefs(username)
      prefs[scopeKey] = newValue
      setUserPrefs(username, prefs)
    }),

    getScopedUserPreferences: moize(key => {
      const { session } = this.props
      // Try to get preferences from session, otherwise get it from localStorage
      return pathOr(
        getStorageUserPrefs(session.username)[key],
        ['userPreferences', key],
        session) || emptyObj
    }, { equals }),
  }

  render () {
    return (
      <PreferencesProvider value={this.state}>
        {this.props.children}
      </PreferencesProvider>
    )
  }
}

export const usePreferences = () => {
  const { session } = useContext(AppContext)
  const { getUserPreferences, initUserPreferences } = useContext(PreferencesContext)
  const userPreferences = useMemo(getUserPreferences, [session.userPreferences])
  return [
    userPreferences,
    initUserPreferences,
  ]
}

/**
 *
 * @param storeKey
 * @param defaultPrefs
 * @returns {{getPrefsUpdater: *, updatePrefs: *, prefs: *}}
 */
export const useScopedPreferences = (storeKey, defaultPrefs = emptyObj) => {
  const { updateScopedUserPreferences, getScopedUserPreferences } = useContext(PreferencesContext)
  const updatePreferences = useCallback(async values => {
    return updateScopedUserPreferences(storeKey, values)
  }, [storeKey])
  const getPrefsUpdater = useMemo(() => {
    return moize((...keys) =>
      (...values) =>
        updatePreferences(zipObj(keys, values)),
    )
  }, [updatePreferences])

  return {
    prefs: { ...defaultPrefs, ...getScopedUserPreferences(storeKey) },
    updatePrefs: updatePreferences,
    getPrefsUpdater,
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
