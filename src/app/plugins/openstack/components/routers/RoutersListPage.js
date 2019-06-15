import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { deleteRouter, loadRouters } from './actions'

export const options = {
  addUrl: '/ui/openstack/routers/add',
  addText: 'Add Router',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'tenant_id', label: 'Tenant' },
    { id: 'admin_state_up', label: 'Admin State' },
    { id: 'status', label: 'Status' },
  ],
  dataKey: 'routers',
  deleteFn: deleteRouter,
  editUrl: '/ui/openstack/routers/edit',
  loaderFn: loadRouters,
  name: 'Routers',
  title: 'Routers',
}

const { ListPage, List } = createCRUDComponents(options)
export const RoutersList = List

export default ListPage
