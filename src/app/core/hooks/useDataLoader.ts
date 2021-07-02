import { allKey } from 'app/constants'
import {
  cacheActions,
  cacheStoreKey,
  loadingStoreKey,
  paramsStoreKey,
} from 'core/caching/cacheReducers'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { either, equals, find, isNil, path, pickAll, pipe, reject } from 'ramda'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { arrayIfNil, emptyObj, ensureFunction, isNilOrEmpty, emptyArr } from 'utils/fp'
import { memoizedDep } from 'utils/misc'

/**
 * Hook to load data using the specified loader function
 * @param {contextLoaderFn} loaderFn
 * @param {object} [params] Any set of params passed to the loader function
 * @returns {[array, boolean, function]} Returns an array with the loaded data, a loading boolean and a function to reload the data
 */
const useDataLoader = (loaderFn, params = emptyObj, options = emptyObj) => {
  // @ts-ignore
  const { loadOnDemand = false, defaultParams = emptyObj, loadingFeedback = true } = options
  const { cacheKey, fetchErrorMessage, selectorCreator, indexBy, cache } = loaderFn
  const { prefs } = useScopedPreferences()
  const { currentTenant, currentRegion } = prefs
  const [refetching, setRefetching] = useState(null)
  const dispatch = useDispatch()

  // Memoize the params dependency as we want to make sure
  // it really changed and not just got a new reference
  const memoizedParams = memoizedDep(params)
  const memoizedIndexedParams = cache
    ? memoizedDep(pipe(pickAll(indexBy), reject(either(isNil, equals(allKey))))(memoizedParams))
    : memoizedParams

  const onErrorHandler = useCallback(
    (catchedErr: Error, reloadData = false) => {
      const title = ensureFunction(fetchErrorMessage)(catchedErr, params)

      console.error(`Error when fetching items for entity "${cacheKey}"`, catchedErr)
      dispatch(
        notificationActions.registerNotification({
          title,
          message: catchedErr.message || catchedErr.toString(),
          type: NotificationType.error,
        }),
      )
    },
    [memoizedParams],
  )

  const selector = useCallback(
    (state) => {
      if (refetching) {
        // Don't try to select the data until we finished the data refetch
        return emptyArr
      }
      try {
        const defaultSelector = selectorCreator(defaultParams)
        const output = defaultSelector(state, memoizedParams)

        // Reset the flag value after a successful data selection
        if (refetching !== null) {
          setRefetching(null)
        }
        return output
      } catch (err) {
        onErrorHandler(err)

        // When we find a selector error, it could mean the data is corruputed,
        // so we force a data reload (only if we haven't tried before)
        if (refetching === null) {
          setRefetching(true)
        }

        // Return an empty array, thus preventing a blank page error
        // that could be consequence of returning a null or undefined
        return emptyArr
      }
    },
    [refetching, memoizedParams],
  )

  // Try to retrieve the data from the store with the provided parameters
  const data = useSelector(selector)

  const paramsSelector = useMemo(
    () =>
      pipe(
        path([cacheStoreKey, paramsStoreKey, cacheKey]),
        arrayIfNil,
        find(equals(memoizedIndexedParams)),
      ),
    [cacheKey, memoizedIndexedParams],
  )
  const cachedParams = useSelector(paramsSelector)

  const loadingSelector = useMemo(() => path([cacheStoreKey, loadingStoreKey, cacheKey]), [
    cacheKey,
  ])
  const loading = useSelector(loadingSelector)

  // We use this ref to flag when the component has been
  // unmounted so we prevent further state updates
  const unmounted = useRef(false)

  // The following function will handle the calls to the data loading and
  // set the loading state variable to true in the meantime, while also taking care
  // of the sequantialization of multiple concurrent calls
  // It will set the result of the last data loading call to the "data" state variable
  const loadData = useCallback(
    async (refetch) => {
      if (refetch || isNilOrEmpty(data) || isNil(cachedParams)) {
        // No need to update loading state if a request is already in progress
        if (loadingFeedback) {
          dispatch(cacheActions.setLoading({ cacheKey, loading: true }))
        }
        try {
          await loaderFn(memoizedParams, refetch)
        } catch (err) {
          onErrorHandler(err)
        }
        // Set the flag to false to allow the selectors to do its thing
        if (refetch) {
          setRefetching(false)
        }
        if (loadingFeedback) {
          dispatch(cacheActions.setLoading({ cacheKey, loading: false }))
        }
      }
    },
    [loaderFn, memoizedIndexedParams],
  )

  // Load the data on component mount and every time the params change
  useEffect(() => {
    if (!loadOnDemand || refetching) {
      loadData(refetching)
    }
  }, [memoizedIndexedParams, currentTenant, currentRegion, loadOnDemand, refetching])

  // When unmounted, set the unmounted ref to true to prevent further state updates
  useEffect(() => {
    return () => {
      unmounted.current = true
    }
  }, [])

  return [data, loading, loadData]
}

export default useDataLoader
