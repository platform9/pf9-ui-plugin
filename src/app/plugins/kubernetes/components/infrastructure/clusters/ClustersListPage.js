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

const getClusterPopoverContent = (healthyMasterNodes, masterNodes) =>
  `${healthyMasterNodes.length} of ${masterNodes.length} master nodes healthy (3 required)`

const getPendingClusterPopoversContent = (cpType, taskStatus) => objSwitchCase({
  creating: `The ${cpType} resources are being created.`,
  converging: 'One or more hosts are joining the cluster',
  updating: `The ${cpType} resources are being updated`,
  deleting: `The cluster and its underlying ${cpType} resources are being deleted`,
})(taskStatus)

const renderStatus = (status,
  { highlyAvailable, healthyMasterNodes, masterNodes, cloudProviderType, progressPercent, taskStatus }) => {
  if (!status || !taskStatus) {
    // TODO probably a better way to handle this.
    // But if we get undefined status The UI currently crashes
    return null
  }
  switch (taskStatus) {
    case 'success': {
      const clusterStatus = <ClusterStatusSpan
        label="Cluster"
        title={status === 'ok'
          ? 'The Cluster is healthy'
          : 'The Platform9 Managed Kubernetes software is converging to the desired state on one or more cluster nodes.'}
        status={status === 'ok' ? 'ok' : 'pause'}>
        {status === 'ok' ? 'Connected' : capitalizeString(status)}
      </ClusterStatusSpan>
      const haStatus = cloudProviderType === 'aws' && <ClusterStatusSpan
        label="HA"
        title={getClusterPopoverContent(healthyMasterNodes, masterNodes)}
        status={highlyAvailable ? 'ok' : 'fail'}>
        {highlyAvailable ? 'Healthy' : 'Unhealthy'}
      </ClusterStatusSpan>

      return <div>
        {clusterStatus}
        {haStatus}
      </div>
    }
    case 'error': {
      return <ClusterStatusSpan
        title="The last cluster operation (create, update, or delete) failed."
        status="fail"
      >
        Unhealthy
      </ClusterStatusSpan>
    }
    case 'creating':
    case 'updating':
    case 'deleting':
    case 'upgrading': {
      return (
        <ClusterSync taskStatus={taskStatus}>
          <ClusterStatusSpan title="The cluster is spinning down.">
            {capitalizeString(taskStatus)}
          </ClusterStatusSpan>
        </ClusterSync>
      )
    }
    default: {
      if (progressPercent) {
        return <div>
          <ProgressBar height={20} animated containedPercent percent={progressPercent
            ? (+progressPercent).toFixed(0)
            : 0} />
          <ClusterStatusSpan
            status="loading"
            title={getPendingClusterPopoversContent(cloudProviderType, taskStatus)}>
            {capitalizeString(taskStatus)}
          </ClusterStatusSpan>
        </div>
      }
      return <ClusterStatusSpan>{capitalizeString(status)}</ClusterStatusSpan>
    }
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
    { id: 'status', label: 'Status', render: renderStatus },
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
