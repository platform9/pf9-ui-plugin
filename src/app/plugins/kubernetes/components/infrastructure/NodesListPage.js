import createCRUDComponents from 'core/createCRUDComponents'

export const options = {
  baseUrl: '/ui/kubernetes/infrastructure/nodes',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'status', label: 'Status' },
    { id: 'primaryIp', label: 'Primary IP' },
    { id: 'compute', label: 'Compute' },
    { id: 'memory', label: 'Memory' },
    { id: 'storage', label: 'Storage' },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'isSpotInstance', label: 'Spot Instance?' },
    { id: 'assignedRoles', label: 'Assigned Roles' },
  ],
  dataKey: 'nodes',
  actions: { service: 'qbert', entity: 'nodes' },
  name: 'Nodes',
  title: 'Nodes',
  debug: true,
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
