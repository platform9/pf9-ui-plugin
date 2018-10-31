import createCRUDComponents from 'core/createCRUDComponents'

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/clusters',
  columns: [
    { id: 'name', label: 'Cluster name' },
    { id: 'status', label: 'Status' },
    { id: 'links', label: 'Links' },
    { id: 'deployment_type', label: 'Deployment Type' },
    { id: 'resource_utilization', label: 'Resource Utilization' },
    { id: 'version', label: 'Kubernetes version' },
    { id: 'network_backend', label: 'Network backend' },
    { id: 'containers_cidr', label: 'Containers CIDR' },
    { id: 'services_cidr', label: 'Services CIDR' },
    { id: 'api_endpoint', label: 'API endpoint' },
    { id: 'cloud_provider', label: 'Cloud provider' },
    { id: 'nodes', label: 'Nodes' },
    { id: 'master_workloads', label: 'Master Workloads' },
    { id: 'privileged', label: 'Privileged' },

    // TODO: We probably want to write a metadata renderer for this kind of format
    // since we use it in a few places for tags / metadata.
    { id: 'metadata', label: 'Metadata', render: data => JSON.stringify(data) }
  ],
  dataKey: 'clusters',
  actions: { service: 'qbert', entity: 'clusters' },
  name: 'Clusters',
  title: 'Clusters',
  uniqueIdentifier: 'uuid',
  rowActions: () => [
    // TODO: scale cluster
    // TODO: upgrade
    // TODO: attach nodes
    // TODO: detach nodes
  ],
  debug: true,
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
