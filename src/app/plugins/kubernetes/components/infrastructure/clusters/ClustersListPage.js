import React, { useContext } from 'react'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
import KubeCLI from './KubeCLI'
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'
import AttachIcon from '@material-ui/icons/AddToQueue'
import DetachIcon from '@material-ui/icons/RemoveFromQueue'
import ScaleIcon from '@material-ui/icons/TrendingUp'
import UpgradeIcon from '@material-ui/icons/PresentToAll'
import { clustersCacheKey } from '../common/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterAttachNodeDialog from './ClusterAttachNodeDialog'
import ClusterDetachNodeDialog from './ClusterDetachNodeDialog'
import ClusterScaleDialog from './ClusterScaleDialog'
import { capitalizeString } from 'utils/misc'
import { objSwitchCase } from 'utils/fp'
import ProgressBar from 'core/components/progress/ProgressBar'
import ClusterStatusSpan from 'k8s/components/infrastructure/clusters/ClusterStatusSpan'
import ResourceUsageTable from 'k8s/components/infrastructure/common/ResourceUsageTable'
import DashboardLink from './DashboardLink'
import CreateButton from 'core/components/buttons/CreateButton'
import { AppContext } from 'core/providers/AppProvider'
import { both, prop } from 'ramda'

const getClusterPopoverContent = (healthyMasterNodes, masterNodes) =>
  `${healthyMasterNodes.length} of ${masterNodes.length} master nodes healthy (3 required)`

const getPendingClusterPopoversContent = (cpType, taskStatus) => objSwitchCase({
  creating: `The ${cpType} resources are being created.`,
  converging: `One or more hosts are joining the cluster`,
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
    case 'success':
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

    case 'error':
      return <ClusterStatusSpan
        title="The last cluster operation (create, update, or delete) failed."
        status="fail"
      >
        Unhealthy
      </ClusterStatusSpan>

    case 'deleting':
      return <ClusterStatusSpan
        title="The cluster is spinning down."
        status="pause"
      >
        Deleting
      </ClusterStatusSpan>

    case 'creating':
      return <ClusterStatusSpan
        title="The cluster is spinning up."
        status="pause"
      >
        Creating
      </ClusterStatusSpan>

    default:
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

const canAttachNode = ([row]) => row.cloudProviderType === 'local'
const canDetachNode = ([row]) => row.cloudProviderType === 'local'
const canScaleCluster = ([row]) => row.cloudProviderType === 'aws'
const canUpgradeCluster = (selected) => false
const canDeleteCluster = ([row]) => !(['creating', 'deleting'].includes(row.taskStatus))

const upgradeCluster = (selected) => {
  console.log('TODO: upgradeCluster')
}

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
    { id: 'cloudProviderType', label: 'Deployment Type' },
    { id: 'resource_utilization', label: 'Resource Utilization', render: renderStats },
    { id: 'version', label: 'Kubernetes Version' },
    { id: 'networkPlugin', label: 'Network Backend' },
    { id: 'containersCidr', label: 'Containers CIDR' },
    { id: 'servicesCidr', label: 'Services CIDR' },
    { id: 'endpoint', label: 'API endpoint' },
    { id: 'cloudProviderName', label: 'Cloud provider' },
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
  // editUrl: '/ui/kubernetes/infrastructure/clusters/edit',
  name: 'Clusters',
  title: 'Clusters',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
  deleteCond: both(isAdmin, canDeleteCluster),
  batchActions: [
    {
      cond: both(isAdmin, canAttachNode),
      icon: <AttachIcon />,
      label: 'Attach node',
      dialog: ClusterAttachNodeDialog,
    },
    {
      cond: both(isAdmin, canDetachNode),
      icon: <DetachIcon />,
      label: 'Detach node',
      dialog: ClusterDetachNodeDialog,
    },
    {
      cond: both(isAdmin, canScaleCluster),
      icon: <ScaleIcon />,
      label: 'Scale cluster',
      dialog: ClusterScaleDialog,
    },
    {
      cond: both(isAdmin, canUpgradeCluster),
      icon: <UpgradeIcon />,
      label: 'Upgrade cluster',
      action: upgradeCluster,
      disabledInfo: 'Feature not yet implemented',
    },
  ],
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
