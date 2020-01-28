import { useState, useCallback, useMemo, useContext, useEffect, useRef } from 'react'
import { useToast } from 'core/providers/ToastProvider'
import { AppContext } from 'core/providers/AppProvider'
import { emptyObj } from 'utils/fp'
import { isEmpty } from 'ramda'

/**
 * Hook to update data using the specified updater function
 * @param {contextUpdaterFn} updaterFn
 * @param {function} [onComplete] Callback to run after updating has been successfully performed
 * @returns {[function, boolean]} Returns an function that will perform the data updating and a loading boolean
 */
const useDataUpdater = (updaterFn, onComplete) => {
  // We use this ref to flag when the component has been unmounted so we prevent further state updates
  const unmounted = useRef(false)

  // FIFO buffer of sequentialized data updating promises
  // The aim of this is to prevent issues in the case two or more subsequent data updating requests
  // are performed with different params, and the previous one didn't have time to finish
  const updaterPromisesBuffer = useRef([])
  const [loading, setLoading] = useState(false)
  const { getContext, setContext, registerNotification } = useContext(AppContext)
  const showToast = useToast()
  const additionalOptions = useMemo(() => ({
    onSuccess: (successMessage, params) => {
      const key = updaterFn.getKey()
      console.info(`Entity "${key}" updated successfully`)
      showToast(successMessage, 'success')
    },
    onError: (errorMessage, catchedErr, params) => {
      const key = updaterFn.getKey()
      console.error(`Error when updating items for entity "${key}"`, catchedErr)
      showToast(errorMessage + `\n${catchedErr.message || catchedErr}`, 'error')
      registerNotification(errorMessage, catchedErr.message || catchedErr, 'error')
    },
  }), [])

  // The following function will handle the calls to the data updating and
  // set the loading state variable to true in the meantime, while also taking care
  // of the sequantialization of multiple concurrent calls
  const update = useCallback(async (params = emptyObj) => {
    // No need to update loading state if a request is already in progress
    if (isEmpty(updaterPromisesBuffer.current)) {
      setLoading(true)
    }

    // Create a new promise that will wait for the previous promises in the buffer before running the new request
    const currentPromise = (async () => {
      await Promise.all(updaterPromisesBuffer.current) // Wait for previous promises to resolve
      const result = await updaterFn({ getContext, setContext, params, additionalOptions })
      updaterPromisesBuffer.current.shift() // Delete the oldest promise in the sequence (FIFO)
      return result
    })()
    updaterPromisesBuffer.current.push(currentPromise)
    const [successful, output] = await currentPromise

    // With this condition, we ensure that all promises except the last one will be ignored
    if (isEmpty(updaterPromisesBuffer.current) &&
      !unmounted.current) {
      setLoading(false)
      if (onComplete) {
        await onComplete(successful, output)
      }
    }
  }, [updaterFn, onComplete, getContext, setContext])

  useEffect(() => {
    return () => {
      // Set the unmounted ref to true to prevent further state updates
      unmounted.current = true
    }
  }, [])

  return [update, loading]
}

export default useDataUpdater
