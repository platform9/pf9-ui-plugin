import React from 'react'
import { mapObjIndexed, prop } from 'ramda'
import { dataCacheKey, cacheStoreKey } from 'core/caching/cacheReducers'
import { useSelector } from 'react-redux'

/**
 * @deprecated Use redux connect instead
 */
const withDataMapper = mappers => Component => props => {
  const cache = useSelector(prop(cacheStoreKey))
  const { [dataCacheKey]: dataCache } = cache
  const mappedData = mapObjIndexed(mapper => mapper(dataCache), mappers)
  return <Component {...props} data={mappedData} />
}

export default withDataMapper
