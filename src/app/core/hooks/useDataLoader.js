import { cacheActions, cacheStoreKey, loadingStoreKey } from 'core/caching/cacheReducers'
import { notificationActions } from 'core/notifications/notificationReducers'
import { useToast } from 'core/providers/ToastProvider'
import moize from 'moize'
import { pathOr } from 'ramda'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { emptyArr, emptyObj, ensureFunction, isNilOrEmpty } from 'utils/fp'
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
  const { loadOnDemand = false, defaultParams = emptyObj } = options
  const { cacheKey, fetchErrorMessage, selectorCreator } = loaderFn

  // Memoize the params dependency as we want to make sure it really changed and not just got a new reference
  const memoizedParams = memoizedDep(params)

  const loadingSelector = useMemo(
    () => pathOr(emptyArr, [cacheStoreKey, loadingStoreKey, cacheKey]),
    [cacheKey],
  )

  const selector = useMemo(() => selectorCreator(defaultParams), [defaultParams])
  const loading = useSelector(loadingSelector)

  // Try to retrieve the data from the store with the provided parameters
  const data = useSelector((state) => selector(state, memoizedParams))

  // const cache = useSelector(prop(cacheStoreKey))
  // const cachedData = cache[dataCacheKey]
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
    async (refetch) => {
      if (refetch || isNilOrEmpty(data)) {
        // No need to update loading state if a request is already in progress
        dispatch(cacheActions.setLoading(true))
        try {
          await loaderFn(memoizedParams, refetch)
        } catch (err) {
          const parsedErrorMesssage = ensureFunction(fetchErrorMessage)(err, params)
          // TODO we should be putting these somewhere in the store to allow more control over the errors handling
          await onError(parsedErrorMesssage, err)
        }
        dispatch(cacheActions.setLoading(false))
      }
    },
    [loaderFn, memoizedParams, data],
  )

  // Load the data on component mount and every time the params
  useEffect(() => {
    if (!loadOnDemand) {
      loadData()
    }
  }, [loadData, loadOnDemand])

  // When unmounted, set the unmounted ref to true to prevent further state updates
  useEffect(() => {
    return () => {
      unmounted.current = true
    }
  }, [])

  return [data, loading, loadData]
}

export default useDataLoader
