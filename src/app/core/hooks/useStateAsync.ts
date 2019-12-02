import { useState, useCallback, useRef, useEffect, SetStateAction } from 'react'

type AsyncSetState<T> = (
  stateUpdate: SetStateAction<T>
) => Promise<T>

const useStateAsync = <T>(initialState: T): [T, AsyncSetState<T>] => {
  const resolvers = useRef<Array<(state: T) => void>>([])
  const [state, setState] = useState<T>(initialState)

  const setStateAsync = useCallback(async (stateUpdater: SetStateAction<T>) => {
    return new Promise<T>((resolve, reject) => {
      setState(prevState => {
        try {
          const newState = stateUpdater instanceof Function
            ? stateUpdater(prevState)
            : stateUpdater

          if (newState === prevState) {
            resolve(newState)
          } else {
            resolvers.current.push(resolve)
          }
          return newState
        } catch (e) {
          reject(e)
          throw e
        }
      })
    })
  }, [setState])

  useEffect(() => {
    return () => {
      resolvers.current.forEach(resolve => resolve(state))
      resolvers.current = []
    }
  }, [state])
  return [state, setStateAsync]
}

export default useStateAsync
