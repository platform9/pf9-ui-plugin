import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { mngmTenantActions } from 'k8s/components/userManagement/actions'

export const options = {
  columns: [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'clusters', label: 'Mapped Clusters' },
  ],
  loaderFn: mngmTenantActions.list,
  deleteFn: mngmTenantActions.delete,
  // editUrl: '/ui/kubernetes/infrastructure/tenants/edit',
  name: 'Tenants',
  title: 'Tenants',
  uniqueIdentifier: 'id',
}

const { ListPage: TenantsListPage } = createCRUDComponents(options)

export default TenantsListPage
