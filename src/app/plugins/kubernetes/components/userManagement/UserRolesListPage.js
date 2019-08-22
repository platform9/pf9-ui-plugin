import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadRoles, deleteRole, mngmRolesDataKey } from 'k8s/components/userManagement/actions'

export const options = {
  loaderFn: loadRoles,
  columns: [
    { id: 'name', label: 'Role' },
    { id: 'description', label: 'Description' },
  ],
  dataKey: mngmRolesDataKey,
  // editUrl: '/ui/kubernetes/infrastructure/roles/edit',
  deleteFn: deleteRole,
  name: 'Roles',
  title: 'Roles',
  uniqueIdentifier: 'id',
}

const { ListPage: UserRolesListPage } = createCRUDComponents(options)

export default UserRolesListPage
