import {
  cacheActions,
  cacheStoreKey,
  loadingStoreKey,
  paramsStoreKey,
} from 'core/caching/cacheReducers'
import { notificationActions } from 'core/notifications/notificationReducers'
import { useToast } from 'core/providers/ToastProvider'
import useScopedPreferences from 'core/session/useScopedPreferences'
import moize from 'moize'
import { find, isNil, path, pickAll, pipe, reject, whereEq } from 'ramda'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { arrayIfNil, emptyObj, ensureFunction, isNilOrEmpty } from 'utils/fp'
import { memoizedDep } from 'utils/misc'

const onErrorHandler = moize(
  (loaderFn, showToast, registerNotification) => (errorMessage, catchedErr) => {
    const { cacheKey } = loaderFn
    console.error(`Error when fetching items for entity "${cacheKey}"`, catchedErr)
    showToast(errorMessage + `\n${catchedErr.message || catchedErr}`, 'error')
    registerNotification(errorMessage, catchedErr.message || catchedErr, 'error')
  },
)

/**
 * Hook to load data using the specified loader function
 * @param {contextLoaderFn} loaderFn
 * @param {object} [params] Any set of params passed to the loader function
 * @returns {[array, boolean, function]} Returns an array with the loaded data, a loading boolean and a function to reload the data
 */
const useDataLoader = (loaderFn, params = emptyObj, options = emptyObj) => {
  const { loadOnDemand = false, defaultParams = emptyObj, loadingFeedback = true } = options
  const { cacheKey, fetchErrorMessage, selectorCreator, indexBy } = loaderFn
  const [{ currentTenant, currentRegion }] = useScopedPreferences()

  // Memoize the params dependency as we want to make sure it really changed and not just got a new reference
  const memoizedParams = memoizedDep(params)
  const memoizedIndexedParams = memoizedDep(pipe(pickAll(indexBy), reject(isNil))(params))

  const selector = useMemo(() => {
    return selectorCreator(defaultParams)
  }, [])

  // Try to retrieve the data from the store with the provided parameters
  const data = useSelector((state) => {
    return selector(state, memoizedParams)
  })

  const paramsSelector = useMemo(
    () =>
      pipe(
        path([cacheStoreKey, paramsStoreKey, cacheKey]),
        arrayIfNil,
        find(whereEq(memoizedIndexedParams)),
        // when(pipe(find(whereEq(memoizedParams)), isNil), always(identity(null))),
      ),
    [cacheKey, memoizedIndexedParams],
  )
  const cachedParams = useSelector(paramsSelector)

  const loadingSelector = useMemo(() => path([cacheStoreKey, loadingStoreKey, cacheKey]), [
    cacheKey,
  ])
  const loading = useSelector(loadingSelector)

  const dispatch = useDispatch()

  // We use this ref to flag when the component has been unmounted so we prevent further state updates
  const unmounted = useRef(false)

  const showToast = useToast()

  // Set a custom error handler for all loading functions using this hook
  // We do this here because we have access to the ToastContext, unlike in the dataLoader functions
  const onError = useMemo(() => {
    const dispatchRegisterNotif = (title, message, type) => {
      dispatch(notificationActions.registerNotification({ title, message, type }))
    }
    return onErrorHandler(loaderFn, showToast, dispatchRegisterNotif)
  }, [])

  // The following function will handle the calls to the data loading and
  // set the loading state variable to true in the meantime, while also taking care
  // of the sequantialization of multiple concurrent calls
  // It will set the result of the last data loading call to the "data" state variable
  const loadData = useCallback(
    async (refetch = true) => {
      if (refetch || isNilOrEmpty(data) || isNil(cachedParams)) {
        // No need to update loading state if a request is already in progress
        if (loadingFeedback) {
          dispatch(cacheActions.setLoading({ cacheKey, loading: true }))
        }
        try {
          await loaderFn(memoizedIndexedParams, refetch)
        } catch (err) {
          const parsedErrorMesssage = ensureFunction(fetchErrorMessage)(err, params)
          // TODO we should be putting these somewhere in the store to allow more control over the errors handling
          onError(parsedErrorMesssage, err)
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
    if (!loadOnDemand) {
      loadData(false)
    }
  }, [memoizedIndexedParams, currentTenant, currentRegion, loadOnDemand])

  // When unmounted, set the unmounted ref to true to prevent further state updates
  useEffect(() => {
    return () => {
      unmounted.current = true
    }
  }, [])

  return [data, loading, loadData]
}

export default useDataLoader
