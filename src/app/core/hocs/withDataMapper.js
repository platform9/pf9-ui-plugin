import React from 'react'
import { mapObjIndexed } from 'ramda'
import { withAppContext } from 'core/AppContext'

const withDataMapper = mappers => Component => withAppContext(props => {
  return <Component {...props} data={mapObjIndexed(mapper => mapper(props), mappers)} />
})

export default withDataMapper
