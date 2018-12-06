import React from 'react'
import createCRUDComponents from 'core/createCRUDComponents'
import { loadInfrastructure } from './actions'
import { maybeFnOrNull } from 'core/fp'
import { pipe } from 'ramda'
import HostStatus from 'core/common/HostStatus'
import { localizeRoles } from 'api-client/ResMgr'
import { castFuzzyBool, columnPathLookup, castBoolToStr } from 'utils/misc'

const renderStatus = (_, node) => (<HostStatus host={node.combined} />)
const renderRoles = (_, node) => localizeRoles(node.combined.roles).join(', ')
const isMaster = pipe(castFuzzyBool, castBoolToStr())

const renderStats = field => pipe(
  columnPathLookup(`combined.usage.${field}`),
  // Offline nodes won't have usage stats
  maybeFnOrNull(stat =>
    <span>{stat.current.toFixed(2)} / {stat.max.toFixed(2)}{stat.units} used</span>
  )
)

const getSpotInstance = pipe(
  columnPathLookup('combined.resmgr.extensions.node_metadata.data.isSpotInstance'),
  castFuzzyBool,
  castBoolToStr(),
)

export const columns = [
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status', render: renderStatus },
  { id: 'primaryIp', label: 'Primary IP' },
  { id: 'compute', label: 'Compute', render: renderStats('compute') },
  { id: 'memory', label: 'Memory', render: renderStats('memory') },
  { id: 'storage', label: 'Storage', render: renderStats('disk') },
  { id: 'clusterName', label: 'Cluster' },
  { id: 'isMaster', label: 'Is Master?', render: isMaster },
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
