import React from 'react'
import { localizeRoles } from 'api-client/ResMgr'
import { maybeFnOrNull } from 'app/utils/fp'
import ExternalLink from 'core/components/ExternalLink'
import HostStatus from 'core/components/HostStatus'
import ProgressBar from 'core/components/progress/ProgressBar'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { pathOr, pipe } from 'ramda'
import { castBoolToStr, castFuzzyBool, columnPathLookup } from 'utils/misc'
import { nodesCacheKey } from 'k8s/components/infrastructure/actions'

const renderStatus = (_, node) => (<HostStatus host={node.combined} />)
const isMaster = pipe(castFuzzyBool, castBoolToStr())

const renderRoles = (_, node) => {
  const roles = pathOr([], ['combined', 'roles'], node)
  return localizeRoles(roles).join(', ')
}

const UsageBar = ({ stat }) => {
  const percent = Math.round((stat.current * 100) / stat.max)
  const cur = stat.current.toFixed(2)
  const max = stat.max.toFixed(2)
  return (
    <ProgressBar
      compact
      percent={percent}
      label={p => <span><strong>{p}%</strong> - {cur} / {max}{stat.units} {stat.type}</span>}
    />
  )
}

const renderStats = field => pipe(
  columnPathLookup(`combined.usage.${field}`),
  // Offline nodes won't have usage stats
  maybeFnOrNull(stat => <UsageBar stat={stat} />)
)

const renderLogs = url => <ExternalLink url={url}>logs</ExternalLink>

const getSpotInstance = pipe(
  columnPathLookup('combined.resmgr.extensions.node_metadata.data.isSpotInstance'),
  castFuzzyBool,
  castBoolToStr(),
)

export const columns = [
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status', render: renderStatus },
  { id: 'logs', label: 'Logs', display: false, render: renderLogs },
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
  addText: 'Add Node',
  addUrl: '/ui/kubernetes/infrastructure/nodes/add',
  columns,
  cacheKey: nodesCacheKey,
  editUrl: '/ui/kubernetes/infrastructure/nodes/edit',
  name: 'Nodes',
  title: 'Nodes',
  uniqueIdentifier: 'uuid',
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
