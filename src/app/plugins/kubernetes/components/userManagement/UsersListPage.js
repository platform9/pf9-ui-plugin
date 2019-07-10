import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadUsers, deleteUser } from 'k8s/components/userManagement/actions'

export const options = {
  loaderFn: loadUsers,
  columns: [
    { id: 'username', label: 'Username' },
    { id: 'displayname', label: 'Display Name' },
    { id: 'two_factor', label: 'Two-Factor Authentication' },
    { id: 'tenants', label: 'Tenants' },
  ],
  dataKey: 'users',
  // editUrl: '/ui/kubernetes/infrastructure/users/edit',
  deleteFn: deleteUser,
  name: 'Users',
  title: 'Users',
  uniqueIdentifier: 'id',
}

const { ListPage: UsersListPage } = createCRUDComponents(options)

export default UsersListPage
