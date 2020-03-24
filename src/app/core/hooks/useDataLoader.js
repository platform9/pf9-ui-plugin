import { useMemo, useEffect, useCallback, useRef, useReducer } from 'react'
import moize from 'moize'
import { emptyArr, emptyObj } from 'utils/fp'
import { isEmpty } from 'ramda'
import { useToast } from 'core/providers/ToastProvider'
import { memoizedDep } from 'utils/misc'
import { notificationActions } from 'core/notifications/notificationReducers'
import { useDispatch } from 'react-redux'

const onErrorHandler = moize((loaderFn, showToast, registerNotification) =>
  (errorMessage, catchedErr, params) => {
    const { cacheKey } = loaderFn
    console.error(`Error when fetching items for entity "${cacheKey}"`, catchedErr)
    showToast(errorMessage + `\n${catchedErr.message || catchedErr}`, 'error')
    registerNotification(errorMessage, catchedErr.message || catchedErr, 'error')
  })

const dataLoaderReducer = (state, { type, payload }) => {
  switch (type) {
    case 'startLoading':
      return state.loading ? state : {
        ...state,
        loading: true,
      }
    case 'finishLoading':
    default:
      return {
        loading: false,
        data: payload,
      }
  }
}

const initState = loadOnDemand => ({
  loading: !loadOnDemand,
  data: emptyArr,
})

/**
 * Hook to load data using the specified loader function
 * @param {contextLoaderFn} loaderFn
 * @param {object} [params] Any set of params passed to the loader function
 * @param {object} [options] Additional custom options
 * @param {boolean} [options.loadOnDemand] If true, data won't be automatically loaded on component mount or update
 * @param {boolean} [options.invalidateCache] Reset cache before performing the loading for the first time
 * @returns {[array, boolean, function]} Returns an array with the loaded data, a loading boolean and a function to reload the data
 */
const useDataLoader = (loaderFn, params = emptyObj, options = emptyObj) => {
  const {
    loadOnDemand = false,
    invalidateCache = false,
  } = options
  const {
    invalidateCache: invalidateCacheFn,
  } = loaderFn
  // const cache = useSelector(prop(cacheStoreKey))
  // const cachedData = cache[dataCacheKey]
  const dispatch = useDispatch()

  // Use this ref to invalidate the cache on component mount so we will force data refetch
  // Invalidating the cache clears all the cache for this entity, unlike using the "refetch"
  // param, which only refreshes data for the current set of params
  const invalidatingCache = useRef(invalidateCache)

  // We use this ref to flag when the component has been unmounted so we prevent further state updates
  const unmounted = useRef(false)

  // FIFO buffer of sequentialized data loading promises
  // The aim of this is to prevent issues in the case two or more subsequent data loading requests
  // are performed with different params, and the previous one didn't have time to finish
  const loaderPromisesBuffer = useRef([])
  const [{ loading, data }, dispatchStatus] = useReducer(dataLoaderReducer, loadOnDemand, initState)
  const showToast = useToast()

  // Set a custom error handler for all loading functions using this hook
  // We do this here because we have access to the ToastContext, unlike in the dataLoader functions
  const additionalOptions = useMemo(() => {
    const dispatchRegisterNotif = (title, message, type) => {
      dispatch(notificationActions.registerNotification({ title, message, type }))
    }
    return {
      // Even if using useMemo, every instance of useDataLoader will create a new function, thus
      // forcing the recalling of the loading function as the memoization of the promise will not work,
      // so we are forced to create a memoized error handler outside of the hook
      onError: onErrorHandler(loaderFn, showToast, dispatchRegisterNotif),
    }
  }, [])

  // Memoize the params dependency as we want to make sure it really changed and not just got a new reference
  const memoizedParams = memoizedDep(params)

  // The following function will handle the calls to the data loading and
  // set the loading state variable to true in the meantime, while also taking care
  // of the sequantialization of multiple concurrent calls
  // It will set the result of the last data loading call to the "data" state variable
  const loadData = useCallback(async refetch => {
    // No need to update loading state if a request is already in progress
    if (isEmpty(loaderPromisesBuffer.current)) {
      dispatchStatus({ type: 'startLoading' })
    }
    if (invalidatingCache.current) {
      invalidateCacheFn()
      invalidatingCache.current = false
    }
    // Create a new promise that will wait for the previous promises in the buffer before running the new request
    const currentPromise = (async () => {
      await Promise.all(loaderPromisesBuffer.current) // Wait for previous promises to resolve
      const result = await loaderFn(params, refetch, additionalOptions)
      loaderPromisesBuffer.current.shift() // Delete the oldest promise in the sequence (FIFO)
      return result
    })()
    loaderPromisesBuffer.current.push(currentPromise)
    const result = await currentPromise

    // With this condition, we ensure that all promises except the last one will be ignored
    if (isEmpty(loaderPromisesBuffer.current) &&
      !unmounted.current) {
      dispatchStatus({ type: 'finishLoading', payload: result })
    }
    return result
  }, [loaderFn, memoizedParams])

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
