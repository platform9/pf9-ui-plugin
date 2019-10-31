import React from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import kubeConfigActions from './actions'

const KubeConfigListPage = () => {
  const columns = getColumns()

  const options = {
    cacheKey: 'apiAccess',
    uniqueIdentifier: 'service',
    loaderFn: kubeConfigActions.list,
    columns,
    name: 'API Access',
    title: 'API Access',
  }

  const { ListPage } = createCRUDComponents(options)

  return <ListPage />
}

const getColumns = () => [
  { id: 'cluster', label: 'Cluster' },
  { id: 'kubeConfig', label: 'kubeconfig', render: (value) => kubeConfigLink(value) },
  { id: 'url', label: 'URL' }
]

// TODO: implement kubebonfig link
const kubeConfigLink = (value) =>
  <a href='#'>Download kubeconfig</a>

export default KubeConfigListPage
