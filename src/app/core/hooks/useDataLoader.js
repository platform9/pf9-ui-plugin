import { useMemo, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import moize from 'moize'
import { emptyObj, isNilOrEmpty, emptyArr, ensureFunction } from 'utils/fp'
import { pathOr, pipe } from 'ramda'
import { useToast } from 'core/providers/ToastProvider'
import { memoizedDep } from 'utils/misc'
import { notificationActions } from 'core/notifications/notificationReducers'
import {
  cacheActions,
  loadingStoreKey,
  cacheStoreKey,
  dataStoreKey,
} from 'core/caching/cacheReducers'
import { createSelector } from 'reselect'
import createSorter from 'core/helpers/createSorter'
import createParamsFilter from 'core/helpers/createParamsFilter'

const onErrorHandler = moize(
  (loaderFn, showToast, registerNotification) => (errorMessage, catchedErr) => {
    const { cacheKey } = loaderFn
    console.error(`Error when fetching items for entity "${cacheKey}"`, catchedErr)
    showToast(errorMessage + `\n${catchedErr.message || catchedErr}`, 'error')
    registerNotification(errorMessage, catchedErr.message || catchedErr, 'error')
  },
)

const getDefaultSelectorCreator = moize((indexBy, cacheKey, selector) => {
  return () =>
    createSelector([selector, (_, params) => params], (items, params) => {
      return pipe(createParamsFilter(indexBy, params), createSorter(params))(items)
    })
})

/**
 * Hook to load data using the specified loader function
 * @param {contextLoaderFn} loaderFn
 * @param {object} [params] Any set of params passed to the loader function
 * @returns {[array, boolean, function]} Returns an array with the loaded data, a loading boolean and a function to reload the data
 */
const useDataLoader = (loaderFn, params = emptyObj, options = emptyObj) => {
  const { loadOnDemand = false } = options
  const {
    cacheKey,
    indexBy,
    fetchErrorMessage,
    selector = pathOr(emptyArr, [cacheStoreKey, dataStoreKey, cacheKey]),
    selectorCreator = getDefaultSelectorCreator(indexBy, cacheKey, selector),
  } = loaderFn

  // Memoize the params dependency as we want to make sure it really changed and not just got a new reference
  const memoizedParams = memoizedDep(params)

  const loadingSelector = useMemo(() => pathOr(emptyArr, [loadingStoreKey, cacheKey]), [cacheKey])

  // Try to retrieve the data from the store with the provided parameters
  const data = useSelector((state) => selectorCreator(state, memoizedParams))
  const loading = useSelector(loadingSelector)

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
