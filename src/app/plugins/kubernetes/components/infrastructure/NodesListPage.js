import React from 'react'
import createCRUDComponents from 'core/createCRUDComponents'
import { loadInfrastructure } from './actions'

const statusRenderer = (contents, row) => {
  return (
    <div>
      <pre>{JSON.stringify(contents, null, 4)}</pre>
    </div>
  )
}

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/nodes',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'status', label: 'Status', render: statusRenderer },
    { id: 'primaryIp', label: 'Primary IP' },
    { id: 'compute', label: 'Compute' },
    { id: 'memory', label: 'Memory' },
    { id: 'storage', label: 'Storage' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'isSpotInstance', label: 'Spot Instance?' },
    { id: 'assignedRoles', label: 'Assigned Roles' },
  ],
  dataKey: 'nodes',
  loaderFn: loadInfrastructure,
  name: 'Nodes',
  title: 'Nodes',
  uniqueIdentifier: 'uuid',
  debug: true,
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
