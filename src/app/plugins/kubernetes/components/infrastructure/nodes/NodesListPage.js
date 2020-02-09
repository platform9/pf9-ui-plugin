import React from 'react'
import { localizeRoles } from 'api-client/ResMgr'
import { pathStrOr } from 'utils/fp'
import ExternalLink from 'core/components/ExternalLink'
import ProgressBar from 'core/components/progress/ProgressBar'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { pathOr, pipe, pick, path } from 'ramda'
import { castBoolToStr, castFuzzyBool, columnPathLookup } from 'utils/misc'
import SimpleLink from 'core/components/SimpleLink'
import { loadNodes, nodesCacheKey } from 'k8s/components/infrastructure/nodes/actions'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatus'
import {
  connectionStatusFieldsTable,
  clusterHealthStatusFields,
} from '../clusters/ClusterStatusUtils'
import DeAuthIcon from '@material-ui/icons/DeleteForever'
import NodeDeAuthDialog from './NodeDeAuthDialog'
import SettingsPhoneIcon from '@material-ui/icons/SettingsPhone'
import RemoteSupportDialog from './RemoteSupportDialog'
import { Tooltip, Typography } from '@material-ui/core'
import { isAdminRole } from 'k8s/util/helpers'
import { listTablePrefs, allKey } from 'app/constants'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import useDataLoader from 'core/hooks/useDataLoader'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import { orderInterfaces } from './NodeDetailsPage'
import ResourceUsageTable from '../common/ResourceUsageTable'
import { makeStyles } from '@material-ui/styles'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles((theme) => ({
  title: {
    display: 'grid',
    gridTemplateColumns: '22px 1fr',
    gridGap: '8px',
    alignItems: 'center',
  },
  link: {
    display: 'inherit',
    color: theme.palette.primary.main,
  },
}))

const defaultParams = {
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('Nodes', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(loadNodes, params)
    // Filter nodes based on cluster
    const filteredNodes = data.filter((node) => {
      if (params.clusterId === allKey) {
        return true
      } else if (params.clusterId === '') {
        return !node.clusterUuid
      } else if (params.clusterId) {
        return node.clusterUuid === params.clusterId
      }
    })

    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={filteredNodes}
        getParamsUpdater={getParamsUpdater}
        filters={
          <>
            <ClusterPicklist
              onChange={getParamsUpdater('clusterId')}
              value={params.clusterId}
              noneLabel="No Cluster"
              selectFirst={false}
              showNone
            />
          </>
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

const renderRoles = (_, node) => {
  const roles = pathOr([], ['combined', 'roles'], node)
  return localizeRoles(roles).join(', ')
}

export const UsageBar = ({ stat }) => {
  const percent = Math.round((stat.current * 100) / stat.max)
  const cur = stat.current.toFixed(2)
  const max = stat.max.toFixed(2)
  return (
    <ProgressBar
      compact
      percent={percent}
      variant="health"
      label={(p) => (
        <span>
          <strong>{p}%</strong> - {cur}/{max}
          {stat.units} {stat.type}
        </span>
      )}
    />
  )
}

const toMHz = (value) => value * 1024
const renderStats = (_, { combined }) => {
  const usage = combined ? combined.usage : null
  const hasValidStats = usage && usage.compute && usage.compute.current
  if (!hasValidStats) {
    return null
  }

  return (
    <>
      <ResourceUsageTable valueConverter={toMHz} units="MHz" label="CPU" stats={usage.compute} />
      <ResourceUsageTable units="GiB" label="Memory" stats={usage.memory} />
      <ResourceUsageTable units="GiB" label="Storage" stats={usage.disk} />
    </>
  )
}

const renderLogs = (url) => (
  <Tooltip title="This is the log file generated by the PMK installer and PMK node status check components (pf9-kube)">
    <div>
      <ExternalLink url={url}>View</ExternalLink>
    </div>
  </Tooltip>
)

const getSpotInstance = pipe(
  columnPathLookup('combined.resmgr.extensions.node_metadata.data.isSpotInstance'),
  castFuzzyBool,
  castBoolToStr(),
)
const NodeDetailLinkComponent = ({ name, node }) => {
  const classes = useStyles()
  const hasSupportRole = !!path(['combined', 'supportRole'], node)
  return (
    <div className={classes.title}>
      <span className={classes.link}>{hasSupportRole && renderRemoteSupport()}</span>
      <SimpleLink src={routes.nodes.detail.path({ id: node.uuid })}>{name}</SimpleLink>
    </div>
  )
}
const renderNodeDetailLink = (name, node) => <NodeDetailLinkComponent name={name} node={node} />

const renderClusterLink = (clusterName, { clusterUuid }) =>
  clusterUuid && (
    <SimpleLink src={routes.cluster.nodes.path({ id: clusterUuid })}>{clusterName}</SimpleLink>
  )

const renderConverging = (clusterUuid) => (
  <ClusterStatusSpan status="loading" iconStatus>
    {clusterUuid ? (
      <SimpleLink src={routes.cluster.nodeHealth.path({ id: clusterUuid })}>Converging</SimpleLink>
    ) : (
      'Converging'
    )}
  </ClusterStatusSpan>
)

const renderRemoteSupport = () => (
  <Tooltip
    title={
      "Advanced Remote Support is currently enabled on this node. To disable it, select the 'Configure Remote Support' action from the actions bar."
    }
  >
    <SettingsPhoneIcon />
  </Tooltip>
)

const renderConnectionStatus = (_, { clusterUuid, status, combined }) => {
  if (status === 'converging') {
    return renderConverging(clusterUuid)
  }

  const connectionStatus = status === 'disconnected' ? 'disconnected' : 'connected'
  const showLastResponse = status === 'disconnected' && combined && combined.lastResponse

  const fields = connectionStatusFieldsTable[connectionStatus]
  return (
    <ClusterStatusSpan status={fields.clusterStatus}>
      {fields.label}
      <br />
      {showLastResponse && `since ${combined.lastResponse}`}
    </ClusterStatusSpan>
  )
}

export const renderNodeHealthStatus = (_, node, onClick = undefined) => {
  const { status, clusterUuid } = node
  if (status === 'converging') {
    return renderConverging(clusterUuid)
  }

  const healthStatus =
    status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
  const fields = clusterHealthStatusFields[healthStatus]

  const content = node.clusterUuid ? (
    <SimpleLink src={routes.cluster.nodeHealth.path({ id: node.clusterUuid })}>
      {fields.label}
    </SimpleLink>
  ) : (
    fields.label
  )
  return (
    <ClusterStatusSpan title={fields.label} status={fields.status}>
      {onClick ? <SimpleLink onClick={() => onClick(node)}>{fields.label}</SimpleLink> : content}
    </ClusterStatusSpan>
  )
}

const renderRole = (_, { isMaster }) => (isMaster ? 'Master' : 'Worker')

const renderApiServer = (_, { isMaster, api_responding: apiResponding }) =>
  castBoolToStr()(!!isMaster && !!apiResponding)

export const renderNetworkInterfaces = (_, node, options = {}) => {
  const { wrapText = false } = options
  const primaryNetwork = pathStrOr(node.primaryIp, 'combined.qbert.primaryIp', node)
  const networkInterfaces = pathStrOr({}, 'combined.networkInterfaces', node)
  const orderedInterfaces = orderInterfaces(networkInterfaces, primaryNetwork)
  return orderedInterfaces.map(([interfaceName, interfaceIp]) => (
    <Typography
      key={`${interfaceName}-${interfaceIp}`}
      variant="body2"
      className={!wrapText ? 'no-wrap-text' : ''}
    >
      {interfaceIp === primaryNetwork ? `${interfaceName} (primary)` : interfaceName} -{' '}
      {interfaceIp}
    </Typography>
  ))
}

const renderOperatingSystem = (_, node) => {
  const operatingSystem =
    pathStrOr('', 'combined.resmgr.info.os_info', node) || pathStrOr('', 'combined.osInfo', node)
  return <Typography variant="body2">{operatingSystem}</Typography>
}

const renderUUID = (_, { uuid }) => {
  return (
    <Tooltip title="This is the unique ID generated by PMK for this node. You will need this ID to perform any API based operations with PMK">
      <Typography variant="body2">{uuid}</Typography>
    </Tooltip>
  )
}

export const columns = [
  { id: 'name', label: 'Name', render: renderNodeDetailLink },
  { id: 'connectionStatus', label: 'Connection status', render: renderConnectionStatus },
  { id: 'healthStatus', label: 'Health status', render: renderNodeHealthStatus },
  { id: 'api_responding', label: 'API server', render: renderApiServer },
  { id: 'logs', label: 'Logs', render: renderLogs },
  { id: 'primaryIp', label: 'Network Interfaces', render: renderNetworkInterfaces },
  { id: 'resource_utilization', label: 'Resource Utilization', render: renderStats },
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
      disabledInfo:
        "You can only de-authorize a node when it's not associated with any cluster. Detach the node from the cluster first.",
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
