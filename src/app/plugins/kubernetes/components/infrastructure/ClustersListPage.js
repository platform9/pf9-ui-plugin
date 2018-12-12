import React from 'react'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
import KubeCLI from './KubeCLI'
import SimpleLink from 'core/common/SimpleLink'
import clusterUsageStats from './clusterUsageStats'
import createCRUDComponents from 'core/createCRUDComponents'
import UsageBar from 'core/common/dashboard_graphs/UsageBar'
import { deleteCluster, loadInfrastructure } from './actions'

const renderLinks = links => {
  if (!links) { return null }
  return (
    <div>
      {links.dashboard && <SimpleLink src={links.dashboard} target="_blank">Dashboard</SimpleLink>}
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

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/clusters',
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
    /*
    // TODO:
    //  Something in this list is causing errors after loadInfrastructure loads.
    //  Disabling these fields until we do more work on clusters.
    { id: 'nodes', label: 'Nodes' },
    */

    // TODO: We probably want to write a metadata renderer for this kind of format
    // since we use it in a few places for tags / metadata.
    { id: 'tags', label: 'Metadata', render: data => JSON.stringify(data) }
  ],
  dataKey: 'clusters',
  loaderFn: loadInfrastructure,
  deleteFn: deleteCluster,
  name: 'Clusters',
  title: 'Clusters',
  uniqueIdentifier: 'uuid',
  rowActions: () => [
    // TODO: scale cluster
    // TODO: upgrade
    // TODO: attach nodes
    // TODO: detach nodes
  ],
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
