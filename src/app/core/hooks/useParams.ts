import { useMemo, useCallback, useReducer, useEffect, Reducer } from 'react'
import moize from 'moize'
import { isEmpty, pick, zipObj, Dictionary } from 'ramda'
import useScopedPreferences from 'core/session/useScopedPreferences'

type ValueOf<T> = T[keyof T]

interface ParamsReducerAction<T> {
  type: 'merge' | 'replace'
  payload: Partial<T>
}

type ParamsReducer<T> = Reducer<T, ParamsReducerAction<T>>

const paramsReducer: <T>(state: T, { type, payload }: ParamsReducerAction<T>) => T = <T>(
  state: T,
  { type, payload },
) => {
  switch (type) {
    case 'merge':
      return { ...state, ...payload }
    case 'replace':
    default:
      return payload
  }
}

interface UseParamsReturnType<T> {
  params: Partial<T>
  updateParams: (newParams: Partial<T>) => void
  setParams: (newParams: T) => void
  getParamsUpdater: (
    ...keys: Array<keyof T>
  ) => (...values: Array<ValueOf<T>>) => Promise<void> | void
}

/**
 * Utility hook to handle a params object
 * Meant to be used along with useDataLoader/useDataUpdater hooks
 * @example
 *
 *   const { params, updateParams, getParamsUpdater } = useParams(defaultParams)
 *   const [data, loading, reload] = useDataLoader(cacheKey, params)
 *
 *   return <Picklist onChange={getParamsUpdater('clusterId')}
 *   Equivalent to:
 *   return <Picklist onChange={clusterId => updateParams({ clusterId })}
 */
const useParams = <T extends Dictionary<any>>(defaultParams?: T): UseParamsReturnType<T> => {
  const [params, dispatch] = useReducer<ParamsReducer<Partial<T>>>(
    paramsReducer,
    defaultParams || {},
  )
  const getParamsUpdater = useMemo(() => {
    return moize((...keys: Array<Extract<keyof T, string>>) => (...values: Array<ValueOf<T>>) =>
      dispatch({
        // FIXME: zipObj return types are too loose so we are forced to use a type cast here
        type: 'merge',
        payload: zipObj<ValueOf<T>, string>(keys, values) as Partial<T>,
      }),
    )
  }, [])

  const updateParams = useCallback((value: Partial<T>): void => {
    dispatch({
      type: 'merge',
      payload: value,
    })
  }, [])

  const setParams = useCallback((value: T) => {
    dispatch({
      type: 'replace',
      payload: value,
    })
  }, [])

  const { prefs } = useScopedPreferences()
  const { currentTenant, currentRegion } = prefs
  // Reset the params when the tenant or the region are changed
  useEffect(() => {
    dispatch({ type: 'replace', payload: defaultParams || {} })
  }, [currentTenant, currentRegion])

  return { params, updateParams, setParams, getParamsUpdater }
}

/**
 * Creates a hook that combines useParams and usePrefs to persist specified param keys to the user preferences
 * @param storeKey User preferences store key
 * @param userPrefKeys Param keys that will be persisted into the user preferences
 */
export const createUsePrefParamsHook = <T extends Dictionary<any>>(
  storeKey: string,
  userPrefKeys: string[],
) => {
  return (defaultParams?: T): UseParamsReturnType<T> => {
    const defaultPrefs = pick(userPrefKeys, defaultParams)
    const { prefs, updatePrefs } = useScopedPreferences(storeKey, defaultPrefs)
    const { params, setParams: setParamsBase, updateParams: updateParamsBase } = useParams<
      Partial<T>
      // @ts-ignore
    >({
      ...(defaultParams || {}),
      ...prefs,
    })
    const updateParams = useCallback(
      async (newParams) => {
        const newPrefs = pick<T, string>(userPrefKeys, newParams)
        if (!isEmpty(newPrefs)) {
          await updatePrefs(newPrefs)
        }
        updateParamsBase(newParams)
      },
      [params],
    )

    const setParams = useCallback(
      async (newParams) => {
        const newPrefs = pick<T, string>(userPrefKeys, newParams)
        if (!isEmpty(newPrefs)) {
          await updatePrefs(newPrefs)
        }
        setParamsBase(newParams)
      },
      [params],
    )

    const getParamsUpdater = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/require-await
      return moize((...keys: Array<Extract<keyof T, string>>) =>
        // FIXME: zipObj return types are too loose so we are forced to use a type cast here
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        (...values: Array<ValueOf<T>>) =>
          updateParams(zipObj<ValueOf<T>, string>(keys, values) as Partial<T>),
      )
    }, [updateParamsBase])

    return { params, updateParams, setParams, getParamsUpdater }
  }
}

export default useParams
