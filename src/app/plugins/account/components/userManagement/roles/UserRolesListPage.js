import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { mngmRoleActions } from 'account/components/userManagement/roles/actions'

export const options = {
  headlessTable: true,
  compactTable: true,
  columns: [
    { id: 'displayName', label: 'Role' },
    { id: 'description', label: 'Description' },
  ],
  actions: mngmRoleActions,
  // editUrl: '/ui/kubernetes/infrastructure/roles/edit',
  name: 'Roles',
  title: 'Roles',
  uniqueIdentifier: 'id',
  showCheckboxes: false,
}

const { ListPage: UserRolesListPage } = createCRUDComponents(options)

export default UserRolesListPage
