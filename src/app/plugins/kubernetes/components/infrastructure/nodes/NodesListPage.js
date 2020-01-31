import React from 'react'
import { localizeRoles } from 'api-client/ResMgr'
import { maybeFnOrNull, pathStrOr } from 'utils/fp'
import ExternalLink from 'core/components/ExternalLink'
import ProgressBar from 'core/components/progress/ProgressBar'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { pathOr, pipe, pick } from 'ramda'
import { castBoolToStr, castFuzzyBool, columnPathLookup } from 'utils/misc'
import SimpleLink from 'core/components/SimpleLink'
import { loadNodes, nodesCacheKey } from 'k8s/components/infrastructure/nodes/actions'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatus'
import ClusterSync from '../clusters/ClusterSync'
import {
  connectionStatusFieldsTable,
  clusterHealthStatusFields,
} from '../clusters/ClusterStatusUtils'
import DeAuthIcon from '@material-ui/icons/DeleteForever'
import NodeDeAuthDialog from './NodeDeAuthDialog'
import SettingsPhoneIcon from '@material-ui/icons/SettingsPhone'
import RemoteSupportDialog from './RemoteSupportDialog'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { Tooltip, Typography } from '@material-ui/core'
import { isAdminRole } from 'k8s/util/helpers'
import { listTablePrefs, allKey } from 'app/constants'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import useDataLoader from 'core/hooks/useDataLoader'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import { orderInterfaces } from './NodeDetailsPage'

const defaultParams = {
  clusterId: allKey
}
const usePrefParams = createUsePrefParamsHook('Nodes', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(loadNodes, params)
    // Filter nodes based on cluster
    const filteredNodes = data.filter(node => {
      if (params.clusterId === allKey) {
        return true
      } else if (params.clusterId === '') {
        return !node.clusterUuid
      } else if (params.clusterId) {
        return node.clusterUuid === params.clusterId
      }
    })

    return <ListContainer
      loading={loading}
      reload={reload}
      data={filteredNodes}
      getParamsUpdater={getParamsUpdater}
      filters={<>
        <ClusterPicklist
          onChange={getParamsUpdater('clusterId')}
          value={params.clusterId}
          noneLabel="No Cluster"
          selectFirst={false}
          showNone
        />
      </>}
      {...pick(listTablePrefs, params)}
    />
  }
}

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
      variant="health"
      label={p => <span><strong>{p}%</strong> - {cur}/{max}{stat.units} {stat.type}</span>}
    />
  )
}

const renderStats = field => pipe(
  columnPathLookup(`combined.usage.${field}`),
  // Offline nodes won't have usage stats
  maybeFnOrNull(stat => <UsageBar stat={stat} />),
)

const renderLogs = url => (
  <Tooltip title="This is the log file generated by the PMK installer and PMK node status check components (pf9-kube)">
    <div>
      <ExternalLink url={url}>logs</ExternalLink>
    </div>
  </Tooltip>
)

const getSpotInstance = pipe(
  columnPathLookup('combined.resmgr.extensions.node_metadata.data.isSpotInstance'),
  castFuzzyBool,
  castBoolToStr(),
)
const renderNodeDetailLink = (name, node) =>
  <SimpleLink src={`/ui/kubernetes/infrastructure/nodes/${node.uuid}`}>{name}</SimpleLink>

const renderClusterLink = (clusterName, { clusterUuid }) => clusterUuid &&
  <SimpleLink src={`/ui/kubernetes/infrastructure/clusters/${clusterUuid}`}>{clusterName}</SimpleLink>

const renderConverging = () =>
  <ClusterSync taskStatus={'converging'}>
    <ClusterStatusSpan>
      Converging
    </ClusterStatusSpan>
  </ClusterSync>

const renderRemoteSupport = () =>
  <div>
    (Advanced Remote Support Enabled)&nbsp;
    <Tooltip title={'Advanced Remote Support is currently enabled on this node. To disable it, select the \'Configure Host\' action from the actions bar.'}>
      <FontAwesomeIcon>question-circle</FontAwesomeIcon>
    </Tooltip>
  </div>

const renderConnectionStatus = (_, { status, combined }) => {
  if (status === 'converging') {
    return renderConverging()
  }

  const connectionStatus = status === 'disconnected' ? 'disconnected' : 'connected'
  const showLastResponse = status === 'disconnected' && combined && combined.lastResponse

  const fields = connectionStatusFieldsTable[connectionStatus]
  return (
    <div>
      <ClusterStatusSpan status={fields.clusterStatus}>
        {fields.label}
        <br />
        {showLastResponse && `since ${combined.lastResponse}`}
      </ClusterStatusSpan>
      {combined.supportRole && renderRemoteSupport()}
    </div>
  )
}

const renderHealthStatus = (_, node, onClick) => {
  const { status } = node
  if (status === 'converging') {
    return renderConverging()
  }

  const healthStatus = status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
  const fields = clusterHealthStatusFields[healthStatus]

  return (
    <ClusterStatusSpan title={fields.label} status={fields.status}>
      {onClick
        ? <SimpleLink onClick={() => onClick(node)}>{fields.label}</SimpleLink>
        : fields.label
      }
    </ClusterStatusSpan>
  )
}

const renderRole = (_, { isMaster }) => isMaster ? 'Master' : 'Worker'

const renderApiServer = (_, { isMaster, api_responding: apiResponding }) => !!isMaster && (!!apiResponding).toString()

const renderNetworkInterfaces = (_, node) => {
  const primaryNetwork = pathStrOr(node.primaryIp, 'combined.qbert.primaryIp', node)
  const networkInterfaces = pathStrOr({}, 'combined.networkInterfaces', node)
  const orderedInterfaces = orderInterfaces(networkInterfaces, primaryNetwork)
  return orderedInterfaces.map(([interfaceName, interfaceIp]) => (
    <Typography key={`${interfaceName}-${interfaceIp}`} variant="body2" className="no-wrap-text">{interfaceIp === primaryNetwork ? `${interfaceName} (primary)` : interfaceName} - {interfaceIp}</Typography>
  ))
}

const renderOperatingSystem = (_, node) => {
  const operatingSystem = pathStrOr('', 'combined.resmgr.info.os_info', node) || pathStrOr('', 'combined.osInfo', node)
  return <Typography variant="body2">{operatingSystem}</Typography>
}

const renderUUID = (_, { uuid }) => {
  return <Tooltip title="This is the unique ID generated by PMK for this node. You will need this ID to perform any API based operations with PMK">
    <Typography variant="body2">{uuid}</Typography>
  </Tooltip>
}

export const columns = [
  { id: 'name', label: 'Name', render: renderNodeDetailLink },
  { id: 'connectionStatus', label: 'Connection status', render: renderConnectionStatus },
  { id: 'healthStatus', label: 'Health status', render: renderHealthStatus },
  { id: 'api_responding', label: 'API server', render: renderApiServer },
  { id: 'logs', label: 'Logs', render: renderLogs },
  { id: 'primaryIp', label: 'Network Interfaces', render: renderNetworkInterfaces },
  { id: 'compute', label: 'Compute', render: renderStats('compute') },
  { id: 'memory', label: 'Memory', render: renderStats('memory') },
  { id: 'storage', label: 'Storage', render: renderStats('disk') },
  { id: 'os', label: 'Operating System', render: renderOperatingSystem },
  { id: 'clusterName', label: 'Cluster', render: renderClusterLink },
  { id: 'isMaster', label: 'Role', render: renderRole },
  { id: 'uuid', label: 'UUID', render: renderUUID, display: false },
  { id: 'isSpotInstance', label: 'Spot Instance?', display: false, render: getSpotInstance },
  { id: 'assignedRoles', label: 'Assigned Roles', render: renderRoles },
]

const isAdmin = (selected, getContext) => {
  return isAdminRole(getContext)
}

export const options = {
  addText: 'Onboard a Node',
  addUrl: '/ui/kubernetes/infrastructure/nodes/cli/download',
  columns,
  cacheKey: nodesCacheKey,
  name: 'Nodes',
  title: 'Nodes',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
  batchActions: [
    {
      cond: ([node]) => !node.clusterUuid,
      icon: <DeAuthIcon />,
      label: 'Deauthorize node',
      dialog: NodeDeAuthDialog,
      disabledInfo: 'You can only de-authorize a node when it\'s not associated with any cluster. Detach the node from the cluster first.'
    },
    {
      cond: isAdmin,
      icon: <SettingsPhoneIcon />,
      label: 'Configure Remote Support',
      dialog: RemoteSupportDialog,
    },
  ],
  ListPage,
}

const components = createCRUDComponents(options)
export const NodesList = components.List

export default components.ListPage
