import { useState, useCallback, useMemo } from 'react'
import moize from 'moize'

const useToggler = (initialValue = false) => {
  const [active, setActive] = useState(initialValue)
  const toggle = useCallback(() => {
    setActive(!active)
  }, [active])
  // Hard set the active state variable to the specified value
  const activeSetter = useMemo(
    () =>
      moize(value => () => setActive(value)),
    [setActive])

  return [active, toggle, activeSetter]
}

export default useToggler
