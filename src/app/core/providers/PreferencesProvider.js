import React, { useContext, useCallback, PureComponent, useMemo } from 'react'
import { connect } from 'react-redux'
import moize from 'moize'
import { curry, zipObj, mergeLeft } from 'ramda'
import { getStorage, setStorage } from '../utils/pf9Storage'
import { emptyObj } from 'utils/fp'
import { sessionStoreKey, sessionActions } from 'core/session/sessionReducers'
import { bindActionCreators } from 'redux'

const userPreferencesKey = username => `user-preferences-${username}`
const setUserPrefs = (username, prefs) => setStorage(userPreferencesKey(username), prefs)
const getStorageUserPrefs = username => getStorage(userPreferencesKey(username)) || emptyObj

export const PreferencesContext = React.createContext({})
export const { Consumer: PreferencesConsumer } = PreferencesContext
export const { Provider: PreferencesProvider } = PreferencesContext

@connect(
  store => ({ session: store[sessionStoreKey] }),
  dispatch => ({ actions: bindActionCreators(sessionActions, dispatch) }),
)
class PreferencesComponent extends PureComponent {
  state = {
    username: null,
    userPreferences: {},

    // Utility function that sets both state.userPreferences[key] and
    // also sets it in localStorage
    updateScopedPreferences: curry(async (scopeKey, values) => {
      const { userPreferences } = this.state
      const currentPrefs = userPreferences[scopeKey]
      const newPrefs = { ...currentPrefs, ...values }

      // Update local storage
      const { username } = this.props.session
      const prefs = getStorageUserPrefs(username)
      setUserPrefs(username, {
        ...prefs,
        [scopeKey]: newPrefs,
      })
      // Update state
      this.setState(mergeLeft({
        userPreferences: newPrefs,
      }))
    }),
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { username } = nextProps.session
    if (username && username !== prevState.username) {
      return {
        userPreferences: getStorageUserPrefs(username),
        username,
      }
    }
    return prevState
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
  const { userPreferences } = useContext(PreferencesContext)
  return userPreferences
}

/**
 *
 * @param storeKey
 * @param defaultPrefs
 * @returns {{getPrefsUpdater: *, updatePrefs: *, prefs: *}}
 */
export const useScopedPreferences = (storeKey, defaultPrefs = emptyObj) => {
  const { updateScopedPreferences, userPreferences } = useContext(PreferencesContext)
  const updatePreferences = useCallback(async values => {
    return updateScopedPreferences(storeKey, values)
  }, [storeKey])
  const getPrefsUpdater = useMemo(() => {
    return moize((...keys) =>
      (...values) =>
        updatePreferences(zipObj(keys, values)),
    )
  }, [updatePreferences])

  return {
    prefs: { ...defaultPrefs, ...(userPreferences[storeKey] || emptyObj) },
    updatePrefs: updatePreferences,
    getPrefsUpdater,
  }
}

export const withPreferences = Component => props =>
  <PreferencesConsumer>
    {
      ({ userPreferences }) =>
        <Component {...props} preferences={userPreferences} />
    }
  </PreferencesConsumer>

export const withScopedPreferences = storeKey => Component => {
  return props =>
    <PreferencesConsumer>
      {
        ({ updateScopedPreferences, userPreferences }) =>
          <Component
            {...props}
            preferences={userPreferences[storeKey] || emptyObj}
            updatePreferences={updateScopedPreferences(storeKey)}
          />
      }
    </PreferencesConsumer>
}

export default PreferencesComponent
