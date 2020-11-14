import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { pipe, pluck, join } from 'ramda'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import { routes } from 'core/utils/routes'

const isNotServiceTenant = (tenants) => !tenants.find((t) => t.name === 'service')

export const options = {
  addUrl: routes.userManagement.addTenant.path(),
  addText: 'Create a New Tenant',
  columns: [
    { id: 'id', label: 'Tenant Uuid' },
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'clusters', label: 'Mapped Clusters' },
    {
      id: 'users',
      label: 'Users',
      display: false,
      render: pipe(pluck('name'), join(', ')),
    },
  ],
  customEditUrlFn: (_, id) => routes.userManagement.editTenant.path({ id }),
  editUrl: true,
  loaderFn: mngmTenantActions.list,
  deleteCond: isNotServiceTenant,
  editCond: isNotServiceTenant,
  deleteFn: mngmTenantActions.delete,
  name: 'Tenants',
  title: 'Tenants',
  uniqueIdentifier: 'id',
}

const { ListPage: TenantsListPage } = createCRUDComponents(options)

export default TenantsListPage
