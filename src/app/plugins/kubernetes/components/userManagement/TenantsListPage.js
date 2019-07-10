import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadTenants, deleteTenant } from 'k8s/components/userManagement/actions'

export const options = {
  loaderFn: loadTenants,
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'clusters', label: 'Mapped Clusters' },
  ],
  dataKey: 'tenants',
  // editUrl: '/ui/kubernetes/infrastructure/tenants/edit',
  deleteFn: deleteTenant,
  name: 'Tenants',
  title: 'Tenants',
  uniqueIdentifier: 'id',
}

const { ListPage: TenantsListPage } = createCRUDComponents(options)

export default TenantsListPage
