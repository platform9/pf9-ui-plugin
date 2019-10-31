import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import endpointsActions from './actions'

const EndpointsListPage = () => {
  const columns = getColumns()

  const options = {
    cacheKey: 'apiAccess',
    uniqueIdentifier: 'service',
    loaderFn: endpointsActions.list,
    columns,
    name: 'API Access',
    title: 'API Access',
  }

  const { ListPage } = createCRUDComponents(options)

  return <ListPage />
}

const getColumns = () => [
  { id: 'service', label: 'Service' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' }
]

export default EndpointsListPage
