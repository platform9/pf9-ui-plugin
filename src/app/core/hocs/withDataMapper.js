import React from 'react'
import { mapObjIndexed, prop } from 'ramda'
import { dataStoreKey, cacheStoreKey } from 'core/caching/cacheReducers'
import { useSelector } from 'react-redux'

/**
 * @deprecated Use redux connect instead
 */
const withDataMapper = (mappers) => (Component) => (props) => {
  const cache = useSelector(prop(cacheStoreKey))
  const { [dataStoreKey]: dataCache } = cache
  const mappedData = mapObjIndexed((mapper) => mapper(dataCache), mappers)
  return <Component {...props} data={mappedData} />
}

export default withDataMapper
