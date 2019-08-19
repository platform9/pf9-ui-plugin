import { useMemo, useEffect, useState, useCallback, useContext } from 'react'
import { emptyArr } from 'utils/fp'
import { ToastContext } from 'core/providers/ToastProvider'
import { AppContext } from 'core/AppProvider'
import { getContextLoader } from 'core/helpers/createContextLoader'

const useDataLoader = (key, params) => {
  const [ loading, setLoading ] = useState(true)
  const [ data, setData ] = useState(emptyArr)
  const { getContext, setContext } = useContext(AppContext)
  const showToast = useContext(ToastContext)
  const getAdditionalOptions = useMemo(() => ({
    onError: (errorMessage, catchedErr, params) => {
      console.error(`Error when fetching items for entity "${key}"`, catchedErr)
      showToast(errorMessage, 'error')
    }
  }), [key, showToast])
  const fetchData = async reload => {
    setLoading(true)
    const loaderFn = getContextLoader(key)
    const additionalOptions = getAdditionalOptions()
    const result = await loaderFn({ getContext, setContext, additionalOptions, params, reload })
    setData(result)
    setLoading(false)
  }
  const reload = useCallback(async () => fetchData(true), [key, params])
  useEffect(fetchData, [key, params])

  return [ data, loading, reload ]
}

export default useDataLoader
