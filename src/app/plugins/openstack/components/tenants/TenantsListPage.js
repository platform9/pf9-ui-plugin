import createCRUDComponents from 'core/createCRUDComponents'
import { deleteTenant, loadTenants } from './actions'

export const options = {
  baseUrl: '/ui/openstack/tenants',
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'computeUsage', label: 'Compute usage' },
    { id: 'blockStorageUsage', label: 'Block storage usage' },
    { id: 'networkUsage', label: 'Network usage' },
  ],
  dataKey: 'tenants',
  deleteFn: deleteTenant,
  loaderFn: loadTenants,
  name: 'Tenants',
  title: 'Tenants',
}

const { ListPage } = createCRUDComponents(options)

export default ListPage
