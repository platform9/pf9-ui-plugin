import React from 'react'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
import KubeCLI from './KubeCLI'
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'
import clusterUsageStats from './clusterUsageStats'
import UsageBar from 'core/components/dashboardGraphs/UsageBar'
import AttachIcon from '@material-ui/icons/AddToQueue'
import DetachIcon from '@material-ui/icons/RemoveFromQueue'
import ScaleIcon from '@material-ui/icons/TrendingUp'
import UpgradeIcon from '@material-ui/icons/PresentToAll'
import { deleteCluster, loadClusters } from './actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterAttachNodeDialog from './ClusterAttachNodeDialog'
import ClusterDetachNodeDialog from './ClusterDetachNodeDialog'
import ClusterScaleDialog from './ClusterScaleDialog'

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

const renderStats = (_, cluster, context) => {
  const { usage } = clusterUsageStats(cluster, context)
  const hasValidStats = usage && usage.compute && usage.compute.current
  if (!hasValidStats) { return null }
  return (
    <div>
      <div>Compute: <UsageBar stats={usage.compute} /></div>
      <div>Memory: <UsageBar stats={usage.memory} /></div>
      <div>Storage: <UsageBar stats={usage.disk} /></div>
    </div>
  )
}

const renderClusterDetailLink = (name, cluster) => <SimpleLink src={`/ui/kubernetes/infrastructure/clusters/${cluster.uuid}`}>{name}</SimpleLink>

const canAttachNode = row => row.cloudProviderType === 'local'
const canDetachNode = row => row.cloudProviderType === 'local'
const canScaleCluster = row => row.cloudProviderType === 'aws'
const canUpgradeCluster = (selected, context) => true

const upgradeCluster = (selected, context) => {
  console.log('TODO: upgradeCluster')
}

export const options = {
  addUrl: '/ui/kubernetes/infrastructure/clusters/add',
  columns: [
    { id: 'name', label: 'Cluster name', render: renderClusterDetailLink },
    { id: 'status', label: 'Status' },
    { id: 'links', label: 'Links', render: renderLinks },
    { id: 'cloudProviderType', label: 'Deployment Type' },
    { id: 'resource_utilization', label: 'Resource Utilization', render: renderStats },
    { id: 'version', label: 'Kubernetes version' },
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
    { id: 'tags', label: 'Metadata', render: data => JSON.stringify(data) }
  ],
  dataKey: 'clusters',
  editUrl: '/ui/kubernetes/infrastructure/clusters/edit',
  loaderFn: loadClusters,
  deleteFn: deleteCluster,
  name: 'Clusters',
  title: 'Clusters',
  uniqueIdentifier: 'uuid',
  rowActions: [
    { cond: canAttachNode, icon: <AttachIcon />, label: 'Attach node', dialog: ClusterAttachNodeDialog },
    { cond: canDetachNode, icon: <DetachIcon />, label: 'Detach node', dialog: ClusterDetachNodeDialog },
    { cond: canScaleCluster, icon: <ScaleIcon />, label: 'Scale cluster', dialog: ClusterScaleDialog },
    { cond: canUpgradeCluster, icon: <UpgradeIcon />, label: 'Upgrade cluster', action: upgradeCluster },
  ],
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
