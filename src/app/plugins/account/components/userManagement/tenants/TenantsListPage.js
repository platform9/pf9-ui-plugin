import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { pipe, pluck, join } from 'ramda'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import { userAccountPrefix } from 'app/constants'
import { pathJoin } from 'utils/misc'

const isNotServiceTenant = (tenants) => !tenants.find((t) => t.name === 'service')

export const options = {
  addUrl: '/ui/account/user_management/tenants/add',
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
  editUrl: pathJoin(userAccountPrefix, 'user_management/tenants/edit'),
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
