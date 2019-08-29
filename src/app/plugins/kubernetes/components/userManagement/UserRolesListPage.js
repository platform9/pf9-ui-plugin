import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { mngmRolesDataKey } from 'k8s/components/userManagement/actions'

export const options = {
  columns: [
    { id: 'name', label: 'Role' },
    { id: 'description', label: 'Description' },
  ],
  dataKey: mngmRolesDataKey,
  // editUrl: '/ui/kubernetes/infrastructure/roles/edit',
  name: 'Roles',
  title: 'Roles',
  uniqueIdentifier: 'id',
}

const { ListPage: UserRolesListPage } = createCRUDComponents(options)

export default UserRolesListPage
