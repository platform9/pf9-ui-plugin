import React from 'react'
import createCRUDComponents from 'core/createCRUDComponents'
import { loadInfrastructure } from './actions'
import { maybeFnOrNull } from 'core/fp'
import { pipe } from 'ramda'
import HostStatus from 'core/common/HostStatus'
import { localizeRole } from 'api-client/ResMgr'
import { castFuzzyBool, columnPathLookup, castBoolToStr } from 'utils/misc'

const renderCluster = (name, node) => name + (node.isMaster ? ' (master)' : '')

const statusRenderer = (_, node) => (<HostStatus host={node.combined} />)

const utilizationRenderer = field => pipe(
  columnPathLookup(`combined.usage.${field}`),
  // Offline nodes won't have usage stats
  maybeFnOrNull(stat =>
    <span>{stat.current.toFixed(2)} / {stat.max.toFixed(2)}{stat.units} used</span>
  )
)

const renderRoles = (_, node) => node.combined.roles.map(localizeRole).join(', ')

const getSpotInstance = pipe(
  columnPathLookup('combined.resmgr.extensions.node_metadata.data.isSpotInstance'),
  castFuzzyBool,
  castBoolToStr(),
)

export const columns = [
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status', render: statusRenderer },
  { id: 'primaryIp', label: 'Primary IP' },
  { id: 'compute', label: 'Compute', render: utilizationRenderer('compute') },
  { id: 'memory', label: 'Memory', render: utilizationRenderer('memory') },
  { id: 'storage', label: 'Storage', render: utilizationRenderer('disk') },
  { id: 'clusterName', label: 'Cluster', renderCluster },
  { id: 'isSpotInstance', label: 'Spot Instance?', render: getSpotInstance },
  { id: 'assignedRoles', label: 'Assigned Roles', render: renderRoles },
]

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/nodes',
  columns,
  dataKey: 'nodes',
  loaderFn: loadInfrastructure,
  name: 'Nodes',
  title: 'Nodes',
  uniqueIdentifier: 'uuid',
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
