import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { usersDataKey } from './actions'

export const options = {
  addUrl: '/ui/openstack/users/add',
  columns: [
    { id: 'name', label: 'Username' },
    { id: 'displayname', label: 'Display name' },
    { id: 'mfa', label: 'Two-factor authentication' },
    { id: 'rolePair', label: 'Tenants & Roles' },
  ],
  dataKey: usersDataKey,
  editUrl: '/ui/openstack/users/edit',
  name: 'Users',
  title: 'Users',
}

const { ListPage, List } = createCRUDComponents(options)
export const UsersList = List

export default ListPage
