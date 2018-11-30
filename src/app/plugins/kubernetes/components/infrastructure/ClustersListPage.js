import React from 'react'
import createCRUDComponents from 'core/createCRUDComponents'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
import KubeCLI from './KubeCLI'
import SimpleLink from 'core/common/SimpleLink'
import { pathOr } from 'ramda'
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

const sumPath = (path, nodes) => (nodes || []).reduce(
  (accum, node) => {
    return accum + pathOr(0, path.split('.'), node)
  },
  0
)

// The cluster resource utilization is the aggregate of all nodes in the cluster.
// This calculation happens every render.  It's not ideal but it isn't that expensive
// so we can probably leave it here.
const renderResourceUtilization = (_, cluster, context) => {
  const nodeIds = cluster.nodes.map(x => x.uuid)
  const combinedNodes = context.combinedHosts
    .filter(x => nodeIds.includes(x.resmgr.id))
  let clusterWithStats = {
    ...cluster,
    usage: {
      compute: {
        current: sumPath('usage.compute.current', combinedNodes),
        max: sumPath('usage.compute.max', combinedNodes),
        units: 'GHz',
        type: 'used',
      },
      memory: {
        current: sumPath('usage.memory.current', combinedNodes),
        max: sumPath('usage.memory.max', combinedNodes),
        units: 'GiB',
        type: 'used',
      },
      disk: {
        current: sumPath('usage.disk.current', combinedNodes),
        max: sumPath('usage.disk.max', combinedNodes),
        units: 'GiB',
        type: 'used',
      }
    }
  }

  const { compute, memory, disk } = clusterWithStats.usage
  clusterWithStats.usage.compute.percent = Math.round(100 * compute.current / compute.max)
  clusterWithStats.usage.memory.percent = Math.round(100 * memory.current / memory.max)
  clusterWithStats.usage.disk.percent = Math.round(100 * disk.current / disk.max)

  return <pre>{JSON.stringify(clusterWithStats.usage, null, 4)}</pre>
}

const renderClusterDetailLink = (name, cluster) => <SimpleLink src={`/ui/kubernetes/infrastructure/clusters/${cluster.uuid}`}>{name}</SimpleLink>

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/clusters',
  columns: [
    { id: 'name', label: 'Cluster name', render: renderClusterDetailLink },
    { id: 'status', label: 'Status' },
    { id: 'links', label: 'Links', render: renderLinks },
    { id: 'cloudProviderType', label: 'Deployment Type' },
    { id: 'resource_utilization', label: 'Resource Utilization', render: renderResourceUtilization },
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
