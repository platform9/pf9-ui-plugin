import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { networksDataKey } from './actions'

export const options = {
  addUrl: '/ui/openstack/networks/add',
  addText: 'Add Network',
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
  dataKey: networksDataKey,
  editUrl: '/ui/openstack/networks/edit',
  name: 'Networks',
  title: 'Networks',
}

const { ListPage, List } = createCRUDComponents(options)
export const NetworksList = List

export default ListPage
