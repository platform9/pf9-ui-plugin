import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { mngmRolesCacheKey } from 'k8s/components/userManagement/actions'

export const options = {
  columns: [
    { id: 'name', label: 'Role' },
    { id: 'description', label: 'Description' },
  ],
  cacheKey: mngmRolesCacheKey,
  // editUrl: '/ui/kubernetes/infrastructure/roles/edit',
  name: 'Roles',
  title: 'Roles',
  uniqueIdentifier: 'id',
}

const { ListPage: UserRolesListPage } = createCRUDComponents(options)

export default UserRolesListPage
