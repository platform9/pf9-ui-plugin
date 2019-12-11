import React, { useContext, useState } from 'react'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
// import KubeCLI from './KubeCLI' // commented out till we support cli links
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'
import ScaleIcon from '@material-ui/icons/TrendingUp'
import UpgradeIcon from '@material-ui/icons/PresentToAll'
import SeeDetailsIcon from '@material-ui/icons/Subject'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import { clustersCacheKey } from '../common/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { capitalizeString } from 'utils/misc'
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
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import {
  getConnectionStatus,
  connectionStatusFieldsTable,
  hasConvergingNodes,
  getHealthStatusAndMessage,
  clusterHealthStatusFields,
  isTransientState,
  isSteadyState,
} from './ClusterStatusUtils'

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

const getNodesDetailsUrl = (uuid) => `/ui/kubernetes/infrastructure/clusters/${uuid}#nodesAndHealthInfo`

const renderConnectionStatus = (_, { taskStatus, nodes, progressPercent, uuid }) => {
  const nodesDetailsUrl = getNodesDetailsUrl(uuid)

  if (isTransientState(taskStatus, nodes)) {
    return renderTransientStatus(taskStatus, nodes, progressPercent)
  }

  const connectionStatus = getConnectionStatus(nodes)
  const fields = connectionStatusFieldsTable[connectionStatus]

  return (
    <ClusterStatusSpan
      title={fields.message}
      status={fields.clusterStatus}>
      <SimpleLink src={nodesDetailsUrl}>{fields.label}</SimpleLink>
    </ClusterStatusSpan>
  )
}

const renderTransientStatus = (taskStatus, nodes, progressPercent) => {
  const currentStatus = hasConvergingNodes(nodes) ? 'converging' : taskStatus
  const spanContent = `The cluster is ${currentStatus}.`

  return (
    <div>
      {progressPercent &&
        <ProgressBar height={20} animated containedPercent percent={progressPercent
          ? (+progressPercent).toFixed(0)
          : 0}
        />
      }
      <ClusterSync taskStatus={currentStatus}>
        <ClusterStatusSpan title={spanContent}>
          {capitalizeString(currentStatus)}
        </ClusterStatusSpan>
      </ClusterSync>
    </div>
  )
}

const renderErrorStatus = (taskError, nodesDetailsUrl) =>
  <ClusterStatusSpan
    title={taskError}
    status='error'
  >
    <SimpleLink src={nodesDetailsUrl}>Error</SimpleLink>
  </ClusterStatusSpan>

const renderClusterHealthStatus = ({ nodes, masterNodes, workerNodes, healthyMasterNodes, healthyWorkerNodes, taskError, nodesDetailsUrl }) => {
  const [healthStatus, message] = getHealthStatusAndMessage({ nodes, masterNodes, workerNodes, healthyMasterNodes, healthyWorkerNodes })
  const fields = clusterHealthStatusFields[healthStatus]

  return (
    <div>
      <ClusterStatusSpan
        title={message}
        status={fields.status}
      >
        <SimpleLink src={nodesDetailsUrl}>{fields.label}</SimpleLink>
      </ClusterStatusSpan>
      {taskError && renderErrorStatus(taskError, nodesDetailsUrl)}
    </div>
  )
}

const renderHealthStatus = (status, {
  taskStatus,
  taskError,
  progressPercent,
  nodes,
  masterNodes,
  workerNodes,
  healthyMasterNodes,
  healthyWorkerNodes,
  uuid,
}) => {
  if (isTransientState(taskStatus, nodes)) {
    return renderTransientStatus(taskStatus, nodes, progressPercent)
  }

  if (isSteadyState(taskStatus, nodes)) {
    const nodesDetailsUrl = getNodesDetailsUrl(uuid)
    return renderClusterHealthStatus({ nodes, masterNodes, workerNodes, healthyMasterNodes, healthyWorkerNodes, taskError, nodesDetailsUrl })
  }

  return status && <ClusterStatusSpan>{capitalizeString(status)}</ClusterStatusSpan>
}

const renderLinks = links => {
  if (!links) { return null }
  return (
    <div>
      {links.dashboard && <ExternalLink url={links.dashboard}>Dashboard</ExternalLink>}
      {links.kubeconfig && <DownloadKubeConfigLink cluster={links.kubeconfig.cluster} />}
      {/* {links.cli && <KubeCLI {...links.cli} />} */}
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
  const [expanded, setExpanded] = useState(false)

  if (!nodes || !nodes.length) {
    return <div>0</div>
  }
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

const canScaleMasters = ([cluster]) => cluster.taskStatus === 'success' && cluster.cloudProviderType === 'bareos' && (cluster.nodes || []).length > 1
const canScaleWorkers = ([cluster]) => cluster.taskStatus === 'success' && cluster.cloudProviderType !== 'azure'
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
    // Disable logging till all CRUD features for log datastores are implemented.
    /* {
      cond: false,
      icon: <DescriptionIcon />,
      label: 'Logging',
      dialog: LoggingAddonDialog,
    }, */
  ],
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
