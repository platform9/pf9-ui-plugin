import { useState, useCallback, useMemo, useContext, useEffect, useRef } from 'react'
import { ToastContext } from 'core/providers/ToastProvider'
import { AppContext } from 'core/AppProvider'

/**
 * Hook to update data using the specified updater function
 * @param {contextUpdaterFn} updaterFn
 * @param {function} [onComplete] Callback to run after updating has been successfully performed
 * @returns {[function, boolean]} Returns an function that will perform the data updating and a loading boolean
 */
const useDataUpdater = (updaterFn, onComplete) => {
  // We use this ref to flag when the component has been unmounted so we prevent further state updates
  const unmounted = useRef(false)
  const [loading, setLoading] = useState(false)
  const { getContext, setContext } = useContext(AppContext)
  const showToast = useContext(ToastContext)
  const additionalOptions = useMemo(() => ({
    onSuccess: (successMessage, params) => {
      const key = updaterFn.getKey()
      console.info(`Entity "${key}" updated successfully`)
      showToast(successMessage, 'success')
    },
    onError: (catchedErr, errorMessage, params) => {
      const key = updaterFn.getKey()
      console.error(`Error when updating entity "${key}"`, catchedErr)
      showToast(errorMessage, 'error')
    }
  }), [showToast])
  const update = useCallback(async (params) => {
    setLoading(true)
    await updaterFn({ getContext, setContext, params, additionalOptions })
    // Make sure the component is not unmounted before updating the state
    if (!unmounted.current) {
      setLoading(false)
      if (onComplete) {
        await onComplete()
      }
    }
  }, [updaterFn, getContext, setContext])

  useEffect(() => {
    return () => {
      // Set the unmounted ref to true to prevent further state updates
      unmounted.current = true
    }
  }, [])

  return [update, loading]
}

export default useDataUpdater
