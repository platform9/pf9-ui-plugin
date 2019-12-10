import React from 'react'
import { localizeRoles } from 'api-client/ResMgr'
import { maybeFnOrNull } from 'utils/fp'
import ExternalLink from 'core/components/ExternalLink'
import HostStatus from 'core/components/HostStatus'
import ProgressBar from 'core/components/progress/ProgressBar'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { pathOr, pipe } from 'ramda'
import { castBoolToStr, castFuzzyBool, columnPathLookup } from 'utils/misc'
import SimpleLink from 'core/components/SimpleLink'
import { nodesCacheKey } from 'k8s/components/infrastructure/nodes/actions'

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
      label={p => <span><strong>{p}%</strong> - {cur}/{max}{stat.units} {stat.type}</span>}
    />
  )
}

const renderStats = field => pipe(
  columnPathLookup(`combined.usage.${field}`),
  // Offline nodes won't have usage stats
  maybeFnOrNull(stat => <UsageBar stat={stat} />),
)

const renderLogs = url => <ExternalLink url={url}>logs</ExternalLink>

const getSpotInstance = pipe(
  columnPathLookup('combined.resmgr.extensions.node_metadata.data.isSpotInstance'),
  castFuzzyBool,
  castBoolToStr(),
)
const renderNodeDetailLink = (name, node) =>
  <SimpleLink src={`/ui/kubernetes/infrastructure/nodes/${node.uuid}`}>{name}</SimpleLink>

const renderClusterLink = (clusterName, { clusterUuid }) => clusterUuid &&
  <SimpleLink src={`/ui/kubernetes/infrastructure/clusters/${clusterUuid}`}>{clusterName}</SimpleLink>

export const columns = [
  { id: 'uuid', label: 'UUID', display: false },
  { id: 'name', label: 'Name', render: renderNodeDetailLink },
  { id: 'status', label: 'Status', render: renderStatus },
  { id: 'logs', label: 'Logs', render: renderLogs },
  { id: 'primaryIp', label: 'Primary IP' },
  { id: 'compute', label: 'Compute', render: renderStats('compute') },
  { id: 'memory', label: 'Memory', render: renderStats('memory') },
  { id: 'storage', label: 'Storage', render: renderStats('disk') },
  { id: 'clusterName', label: 'Cluster', render: renderClusterLink },
  { id: 'isMaster', label: 'Is Master?', render: isMaster },
  { id: 'isSpotInstance', label: 'Spot Instance?', display: false, render: getSpotInstance },
  { id: 'assignedRoles', label: 'Assigned Roles', render: renderRoles },
]

export const options = {
  addText: 'Onboard a Node',
  addUrl: '/ui/kubernetes/infrastructure/nodes/cli/download',
  columns,
  cacheKey: nodesCacheKey,
  name: 'Nodes',
  title: 'Nodes',
  uniqueIdentifier: 'uuid',
  showCheckboxes: false
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
