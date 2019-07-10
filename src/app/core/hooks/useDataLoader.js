import React, { useEffect, useState } from 'react'
import Progress from 'core/components/Progress'
import { useAppContext } from 'core/AppContext'
import { getLoader } from 'core/helpers/contextLoader'

const useDataLoader = (dataKey, render) => {
  return props => {
    const [loading, setLoading] = useState(true)
    const [state, setState] = useState()
    const loader = getLoader(dataKey)
    const appContext = useAppContext()
    useEffect(() => {
      loader(appContext).then(data => {
        setState(data)
        setLoading(false)
      })
    }, [dataKey])
    return (
      <Progress loading={loading}>
        {render({ ...props, data: state })}
      </Progress>
    )
  }
}

export default useDataLoader
