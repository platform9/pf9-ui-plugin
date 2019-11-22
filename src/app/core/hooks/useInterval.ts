import { useEffect, useRef } from 'react'

type ICallback = (...args: any) => void

const useInterval = (callback: ICallback, delay: number = 0) => {
  const savedCallback = useRef<ICallback>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const handler = (...args) => savedCallback.current(...args)
    const id = setInterval(handler, delay)
    return () => clearInterval(id)
  }, [delay])
}

export default useInterval
