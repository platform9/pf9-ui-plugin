import React, { useContext, useState } from 'react'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
import KubeCLI from './KubeCLI'
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'
import ScaleIcon from '@material-ui/icons/TrendingUp'
import UpgradeIcon from '@material-ui/icons/PresentToAll'
import SeeDetailsIcon from '@material-ui/icons/Subject'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import DescriptionIcon from '@material-ui/icons/Description'
import { clustersCacheKey } from '../common/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { capitalizeString } from 'utils/misc'
import { objSwitchCase } from 'utils/fp'
import ProgressBar from 'core/components/progress/ProgressBar'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatusSpan'
import ResourceUsageTable from 'k8s/components/infrastructure/common/ResourceUsageTable'
import DashboardLink from './DashboardLink'
import CreateButton from 'core/components/buttons/CreateButton'
import { AppContext } from 'core/providers/AppProvider'
import { both, prop } from 'ramda'
import PrometheusAddonDialog from 'k8s/components/prometheus/PrometheusAddonDialog'
import ClusterUpgradeDialog from 'k8s/components/infrastructure/clusters/ClusterUpgradeDialog'
import ClusterSync from './ClusterSync'
import LoggingAddonDialog from 'k8s/components/logging/LoggingAddonDialog'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const healthy = 'healthy'
const partiallyHealthy = 'partially_healthy'
const unhealthy = 'unhealthy'

const useStyles = makeStyles(theme => ({
  link: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}))

const renderCloudProviderType = (type, cluster) => {
  if (type === 'local') {
    return 'BareOS'
  }
  return capitalizeString(type)
}

const getPendingClusterPopoversContent = (cpType, taskStatus) => {
  const content = objSwitchCase({
    creating: `The ${cpType} resources are being created.`,
    converging: 'One or more hosts are joining the cluster',
    updating: `The ${cpType} resources are being updated`,
    deleting: `The cluster and its underlying ${cpType} resources are being deleted`,
  })(taskStatus)

  return content
}

const getConnectionStatus = (nodes) => {
  let connectionStatus

  if (nodes.every(node => node.status === 'ok' || node.status === 'failed')) {
    connectionStatus = 'connected'
  } else if (nodes.find(node => node.status === 'ok' || node.status === 'failed')) {
    connectionStatus = 'partially connected'
  } else {
    connectionStatus = 'disconnected'
  }

  return connectionStatus
}

const renderConnectionStatus = (_, { nodes }) => {
  const connectionStatus = getConnectionStatus(nodes)
  let message
  let clusterStatus
  let label

  switch (connectionStatus) {
    case 'connected':
      message = 'All nodes in the cluster are conected to Platform9 management plane.'
      clusterStatus = 'ok'
      label = 'Connected'
      break
    case 'disconnected':
      message = 'All nodes in the cluster are disconected from Platform9 management plane.'
      clusterStatus = 'fail'
      label = 'Disconnected'
      break
    case 'partially connected':
      message = 'Some nodes in the cluster are not connected to Platform9 management plane.'
      clusterStatus = 'pause'
      label = 'Partially Connected'
      break
    default:
  }
  return (
    <ClusterStatusSpan
      title={message}
      status={clusterStatus}>
      {label}
    </ClusterStatusSpan>
  )
}

const getHealthStatusAndMessage = (healthyMasterNodes = [], nodes, numMasters, numWorkers) => {
  const healthyMasterNodesCount = healthyMasterNodes.length
  const healthyWorkersNodesCount = nodes.filter(node => !node.isMaster && node.status === 'ok').length
  const mastersQuorumNumber = numMasters // TODO: how to get quorum number of masters?
  const workersQuorumNumber = Math.ceil(numWorkers/2)
  const mastersHealthStatus = getNodesHealthStatus(healthyMasterNodesCount, numMasters, mastersQuorumNumber)
  const workersHealthStatus = getNodesHealthStatus(healthyWorkersNodesCount, numWorkers, workersQuorumNumber)

  return getClusterHealthStatusAndMessage(mastersHealthStatus, workersHealthStatus)
}

const getNodesHealthStatus = (healthyCount, count, threshold) => {
  let healthStatus

  if (healthyCount === count) {
    healthStatus = healthy
  } else if (healthyCount >= threshold) {
    healthStatus = partiallyHealthy
  } else {
    healthStatus = unhealthy
  }

  return healthStatus
}

const getClusterHealthStatusAndMessage = (mastersHealthStatus, workersHealthStatus) => {
  let healthStatus
  let message

  if (mastersHealthStatus === healthy && workersHealthStatus === healthy) {
    healthStatus = healthy
    message = 'All masters and all workers are healthy'
  } else if (mastersHealthStatus === healthy && workersHealthStatus === partiallyHealthy) {
    healthStatus = healthy
    message = 'All masters are healthy, majority of workers (> 50%) are healthy'
  } else if (mastersHealthStatus === healthy && workersHealthStatus === unhealthy) {
    healthStatus = unhealthy
    message = 'All masters are healthy but majority of workers (> 50%) are unhealthy'
  } else if (mastersHealthStatus === partiallyHealthy && workersHealthStatus === healthy) {
    healthStatus = partiallyHealthy
    message = 'Quorum number of masters are healthy, all workers are healthy'
  } else if (mastersHealthStatus === partiallyHealthy && workersHealthStatus === partiallyHealthy) {
    healthStatus = partiallyHealthy
    message = 'Quorum number of masters are healthy, majority of workers (>50%) are healthy'
  } else if (mastersHealthStatus === partiallyHealthy && workersHealthStatus === unhealthy) {
    healthStatus = unhealthy
    message = 'Quorum number of masters are healthy but majority of workers (> 50%) are unhealthy'
  } else if (mastersHealthStatus === unhealthy && workersHealthStatus === healthy) {
    healthStatus = unhealthy
    message = 'Less than quorum number of masters are healthy, all workers are healthy'
  } else if (mastersHealthStatus === unhealthy && workersHealthStatus === partiallyHealthy) {
    healthStatus = unhealthy
    message = 'Less than quorum number of masters are healthy, majority of workers (>50%) are healthy'
  } else if (mastersHealthStatus === unhealthy && workersHealthStatus === unhealthy) {
    healthStatus = unhealthy
    message = 'Less than quorum number of masters are healthy, and majority of workers (>50%) are unhealthy'
  }

  return [healthStatus, message]
}

const isConverging = (nodes) => !!nodes.find(node => node.status === 'converging')

const isSteadyState = (taskStatus, nodes) =>
  !isConverging(nodes) && (taskStatus === 'success' || taskStatus === 'error')

const isTransientState = (taskStatus, nodes) =>
  taskStatus === 'creating' ||
  taskStatus === 'deleting' ||
  taskStatus === 'updating' ||
  taskStatus === 'upgrading' ||
  isConverging(nodes)

const renderTransientStatus = (taskStatus, nodes) => {
  const status = isConverging(nodes) ? 'converging' : taskStatus

  return (
    <ClusterSync taskStatus={status}>
      <ClusterStatusSpan title="The cluster is spinning down.">
        {capitalizeString(status)}
      </ClusterStatusSpan>
    </ClusterSync>
  )
}

const renderGenericHealthStatus = (status, taskStatus, progressPercent, cloudProviderType) => {
  if (progressPercent) {
    return (
      <div>
        <ProgressBar height={20} animated containedPercent percent={progressPercent
          ? (+progressPercent).toFixed(0)
          : 0}
        />
        <ClusterStatusSpan
          status="loading"
          title={getPendingClusterPopoversContent(cloudProviderType, taskStatus)}>
          {capitalizeString(taskStatus)}
        </ClusterStatusSpan>
      </div>
    )
  } else if (status) {
    return <ClusterStatusSpan>{capitalizeString(status)}</ClusterStatusSpan>
  }
}

const renderClusterHealthStatus = (healthyMasterNodes, nodes, numMasters, numWorkers) => {
  const [healthStatus, message] = getHealthStatusAndMessage(healthyMasterNodes, nodes, numMasters, numWorkers)
  let status
  let label

  switch (healthStatus) {
    case 'healthy':
      status = 'ok'
      label = 'Healthy'
      break
    case 'partially_healthy':
      status = 'pause'
      label = 'Partially healthy'
      break
    case 'unhealthy':
      status = 'fail'
      label = 'Unhealthy'
      break
    default:
  }

  return (
    <ClusterStatusSpan
      title={message}
      status={status}
    >
      {label}
    </ClusterStatusSpan>
  )
}

const renderHealthStatus = (status, {
  taskStatus,
  cloudProviderType,
  progressPercent,
  healthyMasterNodes,
  nodes,
  numMasters,
  numWorkers,
}) => {
  if (isTransientState(taskStatus, nodes)) {
    return renderTransientStatus(taskStatus, nodes)
  } else if (isSteadyState(taskStatus, nodes)) {
    return renderClusterHealthStatus(healthyMasterNodes, nodes, numMasters, numWorkers)
  } else {
    renderGenericHealthStatus(status, taskStatus, progressPercent, cloudProviderType)
  }
}

const renderLinks = links => {
  if (!links) { return null }
  return (
    <div>
      {links.dashboard && <ExternalLink url={links.dashboard}>Dashboard</ExternalLink>}
      {links.kubeconfig && <DownloadKubeConfigLink cluster={links.kubeconfig.cluster} />}
      {links.cli && <KubeCLI {...links.cli} />}
    </div>
  )
}

const renderNodeLink = ({ uuid, name }) => (
  <div key={uuid}>
    <SimpleLink src={`/ui/kubernetes/infrastructure/nodes/${uuid}`}>
      {name}
    </SimpleLink>
  </div>
)

const NodesCell = ({ nodes }) => {
  const classes = useStyles()

  if (!nodes || !nodes.length) {
    return <div>0</div>
  }
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      {expanded ? (
        <div>
          {nodes.map(renderNodeLink)}
          <Typography onClick={() => setExpanded(!expanded)} className={classes.link} component="a">
            (less details)
          </Typography>
        </div>
      ) : (
        <div>
          {nodes.length}&nbsp;
          <Typography onClick={() => setExpanded(!expanded)} className={classes.link} component="a">
            (more details)
          </Typography>
        </div>
      )}
    </div>
  )
}

const toMHz = value => value * 1024

const renderStats = (_, { usage }) => {
  const hasValidStats = usage && usage.compute && usage.compute.current
  if (!hasValidStats) { return null }
  return (
    <div>
      <ResourceUsageTable valueConverter={toMHz} units="MHz" label="CPU" stats={usage.compute} />
      <ResourceUsageTable units="GiB" label="Memory" stats={usage.memory} />
      <ResourceUsageTable units="GiB" label="Storage" stats={usage.disk} />
      {usage.grafanaLink &&
      <DashboardLink label="Grafana" link={usage.grafanaLink} />}
    </div>
  )
}

const renderClusterDetailLink = (name, cluster) =>
  <SimpleLink src={`/ui/kubernetes/infrastructure/clusters/${cluster.uuid}`}>{name}</SimpleLink>

const canScaleMasters = ([cluster]) => cluster.taskStatus === 'success' && cluster.cloudProviderType === 'bareos' && cluster.numMasters > 1
const canScaleWorkers = ([cluster]) => cluster.taskStatus === 'success'
const canUpgradeCluster = (selected) => false
const canDeleteCluster = ([row]) => !(['creating', 'deleting'].includes(row.taskStatus))

const isAdmin = (selected, getContext) => {
  const { role } = getContext(prop('userDetails'))
  return role === 'admin'
}

export const options = {
  addUrl: '/ui/kubernetes/infrastructure/clusters/add',
  addButton: ({ onClick }) => {
    const { userDetails: { role } } = useContext(AppContext)
    if (role !== 'admin') {
      return null
    }
    return <CreateButton onClick={onClick}>Add Cluster</CreateButton>
  },
  columns: [
    { id: 'name', label: 'Cluster name', render: renderClusterDetailLink },
    { id: 'connectionStatus', label: 'Connection status', render: renderConnectionStatus },
    { id: 'healthStatus', label: 'Health status', render: renderHealthStatus },
    { id: 'links', label: 'Links', render: renderLinks },
    { id: 'cloudProviderType', label: 'Deployment Type', render: renderCloudProviderType },
    { id: 'resource_utilization', label: 'Resource Utilization', render: renderStats },
    { id: 'version', label: 'Kubernetes Version' },
    { id: 'networkPlugin', label: 'Network Backend' },
    { id: 'containersCidr', label: 'Containers CIDR' },
    { id: 'servicesCidr', label: 'Services CIDR' },
    { id: 'endpoint', label: 'API endpoint' },
    { id: 'cloudProviderName', label: 'Cloud provider' },
    { id: 'nodes', label: 'Nodes', render: nodes => <NodesCell nodes={nodes} /> },
    { id: 'allowWorkloadsOnMaster', label: 'Master Workloads' },
    { id: 'privileged', label: 'Privileged' },
    { id: 'hasVpn', label: 'VPN' },
    { id: 'appCatalogEnabled', label: 'App Catalog', render: x => x ? 'Enabled' : 'Not Enabled' },
    { id: 'hasLoadBalancer', label: 'Load Balancer' },

    // TODO: We probably want to write a metadata renderer for this kind of format
    //
    // since we use it in a few places for tags / metadata.
    { id: 'tags', label: 'Metadata', render: data => JSON.stringify(data) },
  ],
  cacheKey: clustersCacheKey,
  editUrl: '/ui/kubernetes/infrastructure/clusters/edit',
  name: 'Clusters',
  title: 'Clusters',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
  deleteCond: both(isAdmin, canDeleteCluster),
  batchActions: [
    {
      icon: <SeeDetailsIcon />,
      label: 'See details',
      routeTo: rows => `/ui/kubernetes/infrastructure/clusters/${rows[0].uuid}`,
    },
    {
      cond: both(isAdmin, canScaleMasters),
      icon: <ScaleIcon />,
      label: 'Scale masters',
      routeTo: rows => `/ui/kubernetes/infrastructure/clusters/scaleMasters/${rows[0].uuid}`,
    },
    {
      cond: both(isAdmin, canScaleWorkers),
      icon: <ScaleIcon />,
      label: 'Scale workers',
      routeTo: rows => `/ui/kubernetes/infrastructure/clusters/scaleWorkers/${rows[0].uuid}`,
    },
    {
      cond: both(isAdmin, canUpgradeCluster),
      icon: <UpgradeIcon />,
      label: 'Upgrade cluster',
      dialog: ClusterUpgradeDialog,
    },
    {
      cond: isAdmin,
      icon: <InsertChartIcon />,
      label: 'Monitoring',
      dialog: PrometheusAddonDialog,
    },
    {
      cond: isAdmin,
      icon: <DescriptionIcon />,
      label: 'Logging',
      dialog: LoggingAddonDialog,
    },
  ],
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
