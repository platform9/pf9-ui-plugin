import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { mngmTenantActions } from 'k8s/components/userManagement/actions'
import { pluck } from 'ramda'

export const options = {
  addUrl: '/ui/kubernetes/user_management/tenants/add',
  addText: 'Create a New Tenant',
  columns: [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'clusters', label: 'Mapped Clusters' },
    {
      id: 'users',
      label: 'Users',
      display: false,
      render: users => pluck('name', users).join(', '),
    },
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
