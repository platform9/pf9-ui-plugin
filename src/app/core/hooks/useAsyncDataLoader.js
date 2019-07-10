import { useEffect, useState } from 'react'
import { useAppContext } from 'core/AppContext'
import { getLoader } from 'core/helpers/contextLoader'
// This hook is similar to the `useDataLoader` hook but it returns `state`
// immediately and when the data are loaded.
// It does not display a "Loading..." Progress component.
// It is meant to be used when we want to display the UI sooner and can afford
// to not have all the data loaded immediately.
const useAsyncDataLoader = (dataKey, initialValue) => {
  const [state, setState] = useState(initialValue)
  const loader = getLoader(dataKey)
  const appContext = useAppContext()
  useEffect(() => {
    loader(appContext).then(data => {
      setState(data)
    })
  }, [dataKey])
  return state
}

export default useAsyncDataLoader
