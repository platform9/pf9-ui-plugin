import { useEffect, useRef } from 'react'

type ICallback = (...args: any) => void

const useInterval = (callback: ICallback, delay: number = 0): void => {
  const savedCallback = useRef<ICallback>()

  useEffect((): void => {
    savedCallback.current = callback
  }, [callback])

  useEffect((): () => void => {
    const handler = (...args): void => savedCallback.current(...args)
    const id = setInterval(handler, delay)
    return () => clearInterval(id)
  }, [delay])
}

export default useInterval
