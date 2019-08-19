import { useState, useCallback, useContext } from 'react'
import { useMemo } from 'utils/fp'
import { ToastContext } from 'core/providers/ToastProvider'
import { AppContext } from 'core/AppProvider'
import { getContextUpdater } from 'core/helpers/createContextUpdater'

const useDataUpdater = key => {
  const [loading, setLoading] = useState(true)
  const { getContext, setContext } = useContext(AppContext)
  const showToast = useContext(ToastContext)
  const getAdditionalOptions = useMemo(() => ({
    onSuccess: (successMessage, params) => {
      console.info(`Entity "${key}" updated successfully`)
      showToast(successMessage, 'success')
    },
    onError: (catchedErr, errorMessage, params) => {
      console.error(`Error when updating entity "${key}"`, catchedErr)
      showToast(errorMessage, 'error')
    }
  }), [showToast])
  const update = useCallback(async (params, operation) => {
    setLoading(true)
    const additionalOptions = getAdditionalOptions()
    const updaterFn = getContextUpdater(key, operation)
    await updaterFn({ getContext, setContext, params, additionalOptions })
    setLoading(false)
  }, [getContext, setContext])

  return [ update, loading ]
}

export default useDataUpdater
