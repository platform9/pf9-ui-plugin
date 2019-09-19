import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { routersCacheKey } from './actions'

export const options = {
  addUrl: '/ui/openstack/routers/add',
  addText: 'Add Router',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'tenant_id', label: 'Tenant' },
    { id: 'admin_state_up', label: 'Admin State' },
    { id: 'status', label: 'Status' },
  ],
  cacheKey: routersCacheKey,
  editUrl: '/ui/openstack/routers/edit',
  name: 'Routers',
  title: 'Routers',
}

const { ListPage, List } = createCRUDComponents(options)
export const RoutersList = List

export default ListPage
