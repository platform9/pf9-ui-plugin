import React from 'react'
import createCRUDComponents from 'core/createCRUDComponents'
import { loadInfrastructure } from './actions'
import { pathOrNull } from 'core/fp'
import HostStatus from 'core/common/HostStatus'

const statusRenderer = (contents, node) => (<HostStatus host={node.combined} />)

const utilizationRenderer = field => (contents, node) => {
  const stats = pathOrNull(`combined.usage.${field}`)(node)
  if (!stats) { return null }
  // TODO: make this look nicer
  return <span>{stats.current.toFixed(2)} / {stats.max.toFixed(2)}{stats.units} used</span>
}

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/nodes',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'status', label: 'Status', render: statusRenderer },
    { id: 'primaryIp', label: 'Primary IP' },
    { id: 'compute', label: 'Compute', render: utilizationRenderer('compute') },
    { id: 'memory', label: 'Memory', render: utilizationRenderer('memory') },
    { id: 'storage', label: 'Storage', render: utilizationRenderer('disk') },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'isSpotInstance', label: 'Spot Instance?' },
    { id: 'assignedRoles', label: 'Assigned Roles' },
  ],
  dataKey: 'nodes',
  loaderFn: loadInfrastructure,
  name: 'Nodes',
  title: 'Nodes',
  uniqueIdentifier: 'uuid',
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
