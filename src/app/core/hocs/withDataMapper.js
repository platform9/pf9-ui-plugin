import React, { useContext } from 'react'
import { mapObjIndexed } from 'ramda'
import { AppContext } from 'core/AppProvider'

const withDataMapper = mappers => Component => props => {
  const { getContext } = useContext(AppContext)
  return <Component {...props} data={mapObjIndexed(getContext, mappers)} />
}

export default withDataMapper
