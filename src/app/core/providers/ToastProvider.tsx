import React, {
  FC,
  useReducer,
  useCallback,
  Reducer,
  useContext,
  createContext
} from 'react'
import uuid from 'uuid'
import { append, takeLast, reject, whereEq } from 'ramda'
import ToastContainer, { ToastOptions } from 'core/components/toasts/ToastContainer'
import { except, pipe } from 'utils/fp'
import { MessageTypes } from 'core/components/toasts/ToastItem'

const toastsTimeout = 10000
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
        // Remove previous duplicated messages to prevent flooding the screen
        reject(whereEq({
          text: payload.text,
          variant: payload.variant,
        })),
        append(payload)
      )(state)
    case 'remove':
      return except(payload, state)
    default:
      return state
  }
}

type ShowToastFn = (text: string, type?: MessageTypes) => void

const ToastContext = createContext<ShowToastFn>(null)

const ToastProvider: FC = ({ children }) => {
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
  }, [])

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
