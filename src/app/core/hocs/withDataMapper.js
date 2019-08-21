import React, { useContext } from 'react'
import { mapObjIndexed, pipe, prop } from 'ramda'
import { AppContext } from 'core/AppProvider'
import { dataContextKey } from 'core/helpers/createContextLoader'

const withDataMapper = mappers => Component => props => {
  const { getContext } = useContext(AppContext)
  const mappedData = mapObjIndexed(mapper => {
    const dataContextMapper = pipe(prop(dataContextKey), mapper)
    return getContext(dataContextMapper)
  }, mappers)
  return <Component {...props} data={mappedData} />
}

export default withDataMapper
