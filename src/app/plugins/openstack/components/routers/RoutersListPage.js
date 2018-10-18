import createCRUDComponents from 'core/createCRUDComponents'
import { deleteRouter, loadRouters } from './actions'

export const options = {
  baseUrl: '/ui/openstack/routers',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'tenant_id', label: 'Tenant' },
    { id: 'admin_state_up', label: 'Admin State' },
    { id: 'status', label: 'Status' },
  ],
  dataKey: 'routers',
  deleteFn: deleteRouter,
  loaderFn: loadRouters,
  name: 'Routers',
  title: 'Routers',
}

const { ListPage, List } = createCRUDComponents(options)
export const RoutersList = List

export default ListPage
