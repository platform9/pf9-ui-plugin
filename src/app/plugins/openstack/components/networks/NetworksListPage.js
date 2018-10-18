import createCRUDComponents from 'core/createCRUDComponents'
import { deleteNetwork, loadNetworks } from './actions'

export const options = {
  baseUrl: '/ui/openstack/networks',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'subnets', label: 'Subnets Associated' },
    { id: 'tenant', label: 'Tenant' },
    { id: 'shared', label: 'Shared' },
    { id: 'port_security_enabled', label: 'Port Security' },
    { id: 'external', label: 'External Network' },
    { id: 'admin_state_up', label: 'Admin State' },
    { id: 'status', label: 'Status' },
  ],
  dataKey: 'networks',
  deleteFn: deleteNetwork,
  loaderFn: loadNetworks,
  name: 'Networks',
  title: 'Networks',
}

const { ListPage, List } = createCRUDComponents(options)
export const NetworksList = List

export default ListPage
