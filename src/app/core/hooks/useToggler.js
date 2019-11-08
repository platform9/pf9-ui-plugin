import { useReducer } from 'react'

const useToggler = (initialValue = false) => {
  const [active, toggle] = useReducer(
    prevValue => !prevValue,
    initialValue,
  )
  return [active, toggle]
}

export default useToggler
