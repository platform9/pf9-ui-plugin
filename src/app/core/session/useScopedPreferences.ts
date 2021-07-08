import ApiClient from 'api-client/ApiClient'
import { UserPreferences } from 'app/constants'
import {
  preferencesActions,
  preferencesStoreKey,
  PreferencesState,
} from 'core/session/preferencesReducers'
import { sessionStoreKey, SessionState } from 'core/session/sessionReducers'
import { pathOr, Dictionary, prop, mergeRight } from 'ramda'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { emptyObj } from 'utils/fp'

const { preferenceStore } = ApiClient.getInstance()

const useScopedPreferences = <T extends Dictionary<any>>(
  key: string = 'root',
  defaultPrefs?: T,
): [
  Partial<T>,
  (prefs: Partial<T>) => void,
  (username: string) => Partial<T>,
  (defaultsKey: string, defaults: any) => void,
] => {
  const selectPrefsState = prop<string, PreferencesState>(preferencesStoreKey)
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const allPrefs = useSelector(selectPrefsState)
  const { username, userDetails } = useSelector(selectSessionState)
  const { id } = userDetails || emptyObj
  const prefs = useMemo<Partial<T>>(
    () => ({
      ...(defaultPrefs || {}),
      ...pathOr<Partial<T>>({}, [username, key], allPrefs),
    }),
    [defaultPrefs, username, key, allPrefs],
  )
  const dispatch = useDispatch()
  const updatePrefs = useCallback<(prefs: Partial<T>) => void>(
    (prefs) => {
      if (!username) {
        console.error('Unable to update user preferences. Session has not been initialized')
        return
      }
      dispatch(
        preferencesActions.updatePrefs({
          username,
          key,
          prefs,
        }),
      )
    },
    [username],
  )

  const getUserPrefs = useCallback(
    (username: string) => ({
      ...(defaultPrefs || {}),
      ...pathOr<Partial<T>>({}, [username, key], allPrefs),
    }),
    [defaultPrefs, allPrefs, key],
  )

  const updateUserDefaults = useCallback<(defaultsKey: UserPreferences, value: Partial<T>) => void>(
    (defaultsKey, value) => {
      if (!username) {
        console.error('Unable to update user preferences. Session has not been initialized')
        return
      }
      const updatedPrefs = mergeRight(prefs[defaultsKey] || {}, value)
      preferenceStore.setUserPreference(id, defaultsKey, updatedPrefs)

      dispatch(
        preferencesActions.updatePrefs({
          username,
          key: ['defaults', defaultsKey],
          prefs: value,
        }),
      )
    },
    [username, id, prefs],
  )

  return [prefs, updatePrefs, getUserPrefs, updateUserDefaults]
}

export default useScopedPreferences
