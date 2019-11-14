import React, { useContext } from 'react'
import { mapObjIndexed, pipe, prop } from 'ramda'
import { AppContext } from 'core/providers/AppProvider'
import { dataCacheKey } from 'core/helpers/createContextLoader'

const withDataMapper = mappers => Component => props => {
  const { getContext } = useContext(AppContext)
  const mappedData = mapObjIndexed(mapper => {
    const dataContextMapper = pipe(prop(dataCacheKey), mapper)
    return getContext(dataContextMapper)
  }, mappers)
  return <Component {...props} data={mappedData} />
}

export default withDataMapper
