import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import endpointsActions from './actions'

const EndpointsListPage = () => {
  const columns = getColumns()

  const options = {
    cacheKey: 'apiAccess',
    uniqueIdentifier: 'name',
    loaderFn: endpointsActions.list,
    columns,
    name: 'API Access',
    title: 'API Access',
    showCheckboxes: false,
  }

  const { ListPage } = createCRUDComponents(options)

  return <ListPage />
}

const getColumns = () => [
  { id: 'name', label: 'Service' },
  { id: 'type', label: 'Type' },
  { id: 'url', label: 'URL' }
]

export default EndpointsListPage
