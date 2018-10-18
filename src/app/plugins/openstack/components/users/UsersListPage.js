import createCRUDComponents from 'core/createCRUDComponents'
import { deleteUser, loadUsers } from './actions'

export const options = {
  baseUrl: '/ui/openstack/users',
  columns: [
    { id: 'name', label: 'Username' },
    { id: 'displayname', label: 'Display name' },
    { id: 'mfa', label: 'Two-factor authentication' },
    { id: 'rolePair', label: 'Tenants & Roles' },
  ],
  dataKey: 'users',
  deleteFn: deleteUser,
  loaderFn: loadUsers,
  name: 'Users',
  title: 'Users',
}

const { ListPage } = createCRUDComponents(options)

export default ListPage
