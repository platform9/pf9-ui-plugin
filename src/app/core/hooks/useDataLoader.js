import { useMemo, useEffect, useState, useCallback, useContext } from 'react'
import { emptyArr } from 'utils/fp'
import { path } from 'ramda'
import { ToastContext } from 'core/providers/ToastProvider'
import { AppContext } from 'core/AppProvider'
import { getContextLoader, dataContextKey } from 'core/helpers/createContextLoader'

const useDataLoader = (key, params, refetchOnMount = false) => {
  const [ loading, setLoading ] = useState(false)
  const [ data, setData ] = useState(emptyArr)
  const { getContext, setContext } = useContext(AppContext)
  const [ refetch, setRefetch ] = useState(refetchOnMount)
  const showToast = useContext(ToastContext)
  const additionalOptions = useMemo(() => ({
    onError: (errorMessage, catchedErr, params) => {
      console.error(`Error when fetching items for entity "${key}"`, catchedErr)
      showToast(errorMessage, 'error')
    }
  }), [key, showToast])
  const loadData = async (refetch = false) => {
    setLoading(true)
    const loaderFn = getContextLoader(key)
    const result = await loaderFn({ getContext, setContext, additionalOptions, params, refetch })
    setData(result)
    setLoading(false)
  }
  const reload = useCallback(loadData, [key, params])
  useEffect(() => {
    loadData(refetch)
    setRefetch(false)
  }, [key, getContext(path([dataContextKey, key]))])

  return [data, loading, reload]
}

export default useDataLoader
