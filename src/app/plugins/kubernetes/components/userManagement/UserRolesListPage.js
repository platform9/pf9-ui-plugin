import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadRoles, deleteRole } from 'k8s/components/userManagement/actions'

export const options = {
  loaderFn: loadRoles,
  columns: [
    { id: 'name', label: 'Role' },
    { id: 'description', label: 'Description' },
  ],
  dataKey: 'groups',
  // editUrl: '/ui/kubernetes/infrastructure/groups/edit',
  deleteFn: deleteRole,
  name: 'Roles',
  title: 'Roles',
  uniqueIdentifier: 'id',
}

const { ListPage: UserRolesListPage } = createCRUDComponents(options)

export default UserRolesListPage
