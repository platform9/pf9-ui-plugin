import createCRUDComponents from 'core/helpers/createCRUDComponents'
import floatingIpActions from 'openstack/components/floatingips/actions'

export const options = {
  addUrl: '/ui/openstack/floatingips/add',
  addText: 'Add Floating IP',
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
  deleteFn: floatingIpActions.delete,
  editUrl: '/ui/openstack/floatingips/edit',
  loaderFn: floatingIpActions.list,
  name: 'FloatingIps',
  title: 'Floating IPs',
}

const { ListPage, List } = createCRUDComponents(options)
export const FloatingIpsList = List

export default ListPage
