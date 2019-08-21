import { useState, useCallback, useMemo, useContext } from 'react'
import { ToastContext } from 'core/providers/ToastProvider'
import { AppContext } from 'core/AppProvider'
import { getContextUpdater } from 'core/helpers/createContextUpdater'

const useDataUpdater = (key, defaultOperation, onComplete) => {
  const [loading, setLoading] = useState(false)
  const { getContext, setContext } = useContext(AppContext)
  const showToast = useContext(ToastContext)
  const additionalOptions = useMemo(() => ({
    onSuccess: (successMessage, params) => {
      console.info(`Entity "${key}" updated successfully`)
      showToast(successMessage, 'success')
    },
    onError: (catchedErr, errorMessage, params) => {
      console.error(`Error when updating entity "${key}"`, catchedErr)
      showToast(errorMessage, 'error')
    }
  }), [showToast])
  const update = useCallback(async (params, operation = defaultOperation) => {
    setLoading(true)
    const updaterFn = getContextUpdater(key, operation)
    await updaterFn({ getContext, setContext, params, additionalOptions })
    setLoading(false)
    if (onComplete) {
      await onComplete()
    }
  }, [getContext, setContext, defaultOperation])

  return [update, loading]
}

export default useDataUpdater
