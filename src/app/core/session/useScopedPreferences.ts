import {
  preferencesActions,
  preferencesStoreKey,
  PreferencesState,
} from 'core/session/preferencesReducers'
import { sessionStoreKey, SessionState } from 'core/session/sessionReducers'
import { pathOr, Dictionary, prop } from 'ramda'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useScopedPreferences = <T extends Dictionary<any>>(
  key: string = 'root',
  defaultPrefs?: T,
): [Partial<T>, (prefs: Partial<T>) => void, (username: string) => Partial<T>] => {
  const selectPrefsState = prop<string, PreferencesState>(preferencesStoreKey)
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const allPrefs = useSelector(selectPrefsState)
  const { username } = useSelector(selectSessionState)
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

  return [prefs, updatePrefs, getUserPrefs]
}

export default useScopedPreferences
