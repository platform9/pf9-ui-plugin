import { useReducer, useCallback } from 'react'

const useToggler = (initialValue = false) => {
  const [active, toggleVal] = useReducer(
    prevValue => !prevValue,
    initialValue,
  )
  const toggle = useCallback(() => toggleVal(), [])
  return [active, toggle]
}

export default useToggler
