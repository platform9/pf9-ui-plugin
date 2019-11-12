import { emptyObj } from 'utils/fp'
import { useMemo, useState, useCallback, useReducer } from 'react'
import moize from 'moize'
import { isEmpty, pick, zipObj } from 'ramda'
import { useScopedPreferences } from 'core/providers/PreferencesProvider'

/**
 * Utility hook to handle a params object
 * Meant to be used along with useDataLoader/useDataUpdater hooks
 * @typedef {object} useParams
 * @param defaultParams
 * @returns {{ params: object, updateParams: updateParamsFn, getParamsUpdater: getParamsUpdaterFn}}
 * @example
 *
 *   const { params, updateParams, getParamsUpdater } = useParams(defaultParams)
 *   const [data, loading, reload] = useDataLoader(cacheKey, params)
 *
 *   return <Picklist onChange={getParamsUpdater('clusterId')}
 *   Equivalent to:
 *   return <Picklist onChange={clusterId => updateParams({ clusterId })}
 */
const useParams = (defaultParams = emptyObj) => {
  const [params, updateParams] = useReducer(
    (prevParams, newParams) => ({ ...prevParams, ...newParams }),
    defaultParams,
  )
  const getParamsUpdater = useMemo(() => {
    return moize((...keys) =>
      (...values) => updateParams(zipObj(keys, values)),
    )
  }, [updateParams])

  return { params, updateParams, getParamsUpdater }
}

/**
 * Creates a hook that combines useParams and usePrefs to persist specified param keys to the user preferences
 * @param storeKey User preferences store key
 * @param userPrefKeys Param keys that will be persisted into the user preferences
 * @returns useParams
 */
export const createUsePrefParamsHook = (storeKey, userPrefKeys) => {
  return (defaultParams = emptyObj) => {
    const defaultPrefs = pick(userPrefKeys, defaultParams)
    const { prefs, updatePrefs } = useScopedPreferences(storeKey, defaultPrefs)
    const [params, setParams] = useState({ ...defaultParams, ...prefs })
    const updateParams = useCallback(
      async newParams => {
        const newPrefs = pick(userPrefKeys, newParams)
        if (!isEmpty(newPrefs)) {
          await updatePrefs(newPrefs)
        }
        setParams({ ...params, ...newParams })
      },
      [params])
    const getParamsUpdater = useMemo(() => {
      return moize((...keys) =>
        (...values) => updateParams(zipObj(keys, values)),
      )
    }, [updateParams])

    return { params, updateParams, getParamsUpdater }
  }
}

export default useParams

/**
 * Function that will update the params object with a new set of provided key/values,
 * keeping the previous existing values (equivalent to Object.assign)
 * @typedef {function} updateParamsFn
 * @type {function}
 * @param {object} New params
 */

/**
 * Returns a function that can be used to update one or more param keys,
 * keeping the previous existing values (see example)
 * @typedef {function} getParamsUpdaterFn
 * @type {function}
 * @param {...string} Keys that will have to be providen to the updater function
 * @example
 *
 * getParamsUpdater('orderBy', 'orderDirection')
 *
 * // This will get us a function equivalent to:
 * function (orderBy, orderDirection) {
 *   updateParams({ orderBy, orderDirection })
 * }
 */
