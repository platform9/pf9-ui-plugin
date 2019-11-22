import React, {
  FunctionComponent,
  useReducer,
  useCallback,
  Reducer,
  useContext
} from 'react'
import uuid from 'uuid'
import { append, takeLast } from 'ramda'
import ToastContainer, { ToastOptions } from 'core/components/toasts/ToastContainer'
import { except, pipe } from 'utils/fp'
import { MessageTypes } from 'core/components/toasts/ToastItem'

const toastsTimeout = 8000
const concurrentToasts = 5

interface ToastReducerAction {
  type: 'add' | 'remove'
  payload: ToastOptions
}

const toastReducer: Reducer<ToastOptions[], ToastReducerAction> = (state, { type, payload }) => {
  switch (type) {
    case 'add':
      return pipe(
        takeLast(concurrentToasts - 1),
        append(payload)
      )(state)
    case 'remove':
      return except(payload, state)
    default:
      return state
  }
}

type ShowToastFn = (text: string, type?: MessageTypes) => void

const ToastContext = React.createContext<ShowToastFn>(null)

const ToastProvider: FunctionComponent = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, [])

  const showToast: ShowToastFn = useCallback((text, variant = MessageTypes.info) => {
    const payload: ToastOptions = {
      id: uuid.v4(),
      text,
      variant,
      isOpen: true,
      onClose: () => dispatch({ type: 'remove', payload })
    }
    dispatch({ type: 'add', payload })
  }, [dispatch])
  return (
    <ToastContext.Provider value={showToast}>
      <ToastContainer toasts={toasts} toastsTimeout={toastsTimeout} />
      {children}
    </ToastContext.Provider>
  )
}

export default ToastProvider

export const withToast = Component => props =>
  <ToastContext.Consumer>
    {showToast => <Component {...props} showToast={showToast} />}
  </ToastContext.Consumer>

export const useToast: () => ShowToastFn = () => {
  return useContext(ToastContext)
}
