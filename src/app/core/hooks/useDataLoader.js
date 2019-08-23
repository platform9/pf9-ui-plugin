import { useMemo, useEffect, useState, useCallback, useContext, useRef } from 'react'
import { emptyArr } from 'utils/fp'
import { isEmpty } from 'ramda'
import { ToastContext } from 'core/providers/ToastProvider'
import { AppContext } from 'core/AppProvider'
import { getContextLoader } from 'core/helpers/createContextLoader'
import { memoizedDep } from 'utils/misc'

const useDataLoader = (key, params, refetchOnMount = false) => {
  const refetching = useRef(refetchOnMount)
  const accPromises = useRef([])
  const [ loading, setLoading ] = useState(false)
  const [ data, setData ] = useState(emptyArr)
  const { getContext, setContext } = useContext(AppContext)
  const showToast = useContext(ToastContext)
  const additionalOptions = useMemo(() => ({
    onError: (errorMessage, catchedErr, params) => {
      console.error(`Error when fetching items for entity "${key}"`, catchedErr)
      showToast(errorMessage, 'error')
    }
  }), [key, showToast])
  const loadData = async refetch => {
    // No need to update loading state if a request is already in progress
    if (isEmpty(accPromises.current)) {
      setLoading(true)
    }
    const loaderFn = getContextLoader(key)
    const currentPromise = (async () => {
      await Promise.all(accPromises.current) // Wait for previous promises to resolve
      const result = await loaderFn({ getContext, setContext, additionalOptions, params, refetch })
      accPromises.current.shift() // Delete the oldest promise in the sequence (FIFO)
      return result
    })()
    accPromises.current.push(currentPromise)
    const result = await currentPromise

    // With this, we ensure that all promises except the last one will be ignored
    if (isEmpty(accPromises.current)) {
      setLoading(false)
      setData(result)
    }
  }
  const reload = useCallback(loadData, [key, memoizedDep(params)])
  useEffect(() => {
    loadData(refetching.current)
    if (refetching.current) {
      refetching.current = false
    }
  }, [key, memoizedDep(params)])

  return [data, loading, reload]
}

export default useDataLoader
