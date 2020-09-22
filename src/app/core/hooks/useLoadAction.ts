import Action from 'core/actions/Action'
import { arrayIfNil, ensureFunction, isNilOrEmpty } from 'utils/fp'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { memoizedDep } from 'utils/misc'
import {
  either,
  equals,
  find,
  isNil,
  path,
  pickAll,
  pipe,
  reject,
  whereEq,
} from 'ramda'
import { allKey } from 'app/constants'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  cacheActions,
  cacheStoreKey,
  loadingStoreKey,
  paramsStoreKey,
} from 'core/caching/cacheReducers'
import { useToast } from 'core/providers/ToastProvider'
import { notificationActions } from 'core/notifications/notificationReducers'
import moize from 'moize'
import { OutputParametricSelector } from 'reselect'

const onErrorHandler = moize(
  (cacheKey, showToast, registerNotification) => (errorMessage, catchedErr) => {
    console.error(`Error when fetching items for entity "${cacheKey}"`, catchedErr)
    showToast(`${errorMessage}\n${catchedErr.message || catchedErr}`, 'error')
    registerNotification(errorMessage, catchedErr.message || catchedErr, 'error')
  },
)

interface Options<T, R> {
  action: Action<T, R>
  selector: OutputParametricSelector<any, Dictionary<any>>
  params: T
  loadOnDemand?: boolean
  loadingFeedback?: boolean
}

const useLoadAction = <T, R>(options: Options = {}) => {
  const { action, selector, params, loadOnDemand = false, loadingFeedback = true } = options
  const { cacheKey, errorMessage, indexBy, cache } = action.config
  const [{ currentTenant, currentRegion }] = useScopedPreferences()

  // Memoize the params dependency as we want to make sure it really changed and not just got a new reference
  const memoizedParams = memoizedDep(params)
  const memoizedIndexedParams = cache
    ? // @ts-ignore
      memoizedDep(pipe(pickAll(indexBy), reject(either(isNil, equals(allKey))))(memoizedParams))
    : memoizedParams

  const paramsSelector = useMemo(
    () =>
      pipe(
        path([cacheStoreKey, paramsStoreKey, cacheKey]),
        arrayIfNil,
        find(whereEq(memoizedIndexedParams)),
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
    return onErrorHandler(cacheKey, showToast, dispatchRegisterNotif)
  }, [])

  // The following function will handle the calls to the data loading and
  // set the loading state variable to true in the meantime, while also taking care
  // of the sequantialization of multiple concurrent calls
  // It will set the result of the last data loading call to the "data" state variable
  const loadData = useCallback(
    async (refetch = true) => {
      if (refetch || isNilOrEmpty(selectedData) || isNil(cachedParams)) {
        // No need to update loading state if a request is already in progress
        if (loadingFeedback) {
          dispatch(cacheActions.setLoading({ cacheKey, loading: true }))
        }
        try {
          await action.run(memoizedParams)
        } catch (err) {
          const parsedErrorMesssage = ensureFunction(errorMessage)(err, params)
          // TODO we should be putting these somewhere in the store to allow more control over the errors handling
          onError(parsedErrorMesssage, err)
        }
        if (loadingFeedback) {
          dispatch(cacheActions.setLoading({ cacheKey, loading: false }))
        }
      }
    },
    [memoizedIndexedParams],
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

  return [loading, loadData]
}

export default useLoadAction
