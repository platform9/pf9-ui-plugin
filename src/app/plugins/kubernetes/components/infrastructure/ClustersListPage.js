import React from 'react'
import createCRUDComponents from 'core/createCRUDComponents'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
import KubeCLI from './KubeCLI'
import SimpleLink from 'core/common/SimpleLink'
import { loadInfrastructure } from './actions'

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

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/clusters',
  columns: [
    { id: 'name', label: 'Cluster name' },
    { id: 'status', label: 'Status' },
    { id: 'links', label: 'Links', render: renderLinks },
    { id: 'deployment_type', label: 'Deployment Type' },
    { id: 'resource_utilization', label: 'Resource Utilization' },
    { id: 'version', label: 'Kubernetes version' },
    /*
    // TODO:
    //  Something in this list is causing errors after loadInfrastructure loads.
    //  Disabling these fields until we do more work on clusters.
    { id: 'network_backend', label: 'Network backend' },
    { id: 'containers_cidr', label: 'Containers CIDR' },
    { id: 'services_cidr', label: 'Services CIDR' },
    { id: 'api_endpoint', label: 'API endpoint' },
    { id: 'cloud_provider', label: 'Cloud provider' },
    { id: 'nodes', label: 'Nodes' },
    { id: 'master_workloads', label: 'Master Workloads' },
    { id: 'privileged', label: 'Privileged' },
    */

    // TODO: We probably want to write a metadata renderer for this kind of format
    // since we use it in a few places for tags / metadata.
    { id: 'metadata', label: 'Metadata', render: data => JSON.stringify(data) }
  ],
  dataKey: 'clusters',
  loaderFn: loadInfrastructure,
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
