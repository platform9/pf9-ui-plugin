import createCRUDComponents from 'core/createCRUDComponents'
import { deleteFloatingIp, loadFloatingIps } from './actions'

export const options = {
  baseUrl: '/ui/openstack/floatingips',
  columns: [
    { id: 'floating_ip_address', label: 'Floating IP' },
    { id: 'subnet_id', label: 'Subnet ID' },
    { id: 'tenant_id', label: 'Tenant ID' },
    { id: 'fixed_ip_address', label: 'Fixed IP' },
    { id: 'description', label: 'Description' },
    { id: 'floating_network_id', label: 'Floating Network ID' },
    { id: 'status', label: 'Status' },
    { id: 'router_id', label: 'Router ID' },
  ],
  dataKey: 'floatingIps',
  deleteFn: deleteFloatingIp,
  loaderFn: loadFloatingIps,
  name: 'FloatingIps',
  title: 'Floating IPs',
}

const { ListPage, List } = createCRUDComponents(options)
export const FloatingIpsList = List

export default ListPage
