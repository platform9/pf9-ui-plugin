import { useReducer, useCallback, Reducer } from 'react'

interface TogglerReducerAction {
  type: 'toggle' | 'assign'
  payload?: boolean
}

type TogglerReducer = Reducer<boolean, TogglerReducerAction>

const toggleReducer: TogglerReducer = (state: boolean, { type, payload }) => {
  switch (type) {
    case 'toggle':
      return !state
    case 'assign':
    default:
      return payload
  }
}

const useToggler = (initialValue = false) => {
  const [active, dispatch] = useReducer<TogglerReducer>(toggleReducer, initialValue)
  const toggle = useCallback(prevValue => dispatch({
    type: 'toggle'
  }), [])
  const setValue = useCallback((value: boolean) => dispatch({
    type: 'assign', payload: value
  }), [])

  return [active, toggle, setValue]
}

export default useToggler
