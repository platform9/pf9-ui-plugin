import createCRUDComponents from 'core/helpers/createCRUDComponents'
import DataKeys from 'k8s/DataKeys'

export const options = {
  addUrl: '/ui/openstack/users/add',
  columns: [
    { id: 'name', label: 'Username' },
    { id: 'displayname', label: 'Display name' },
    { id: 'mfa', label: 'Two-factor authentication' },
    { id: 'rolePair', label: 'Tenants & Roles' },
  ],
  cacheKey: DataKeys.Users,
  editUrl: '/ui/openstack/users/edit',
  name: 'Users',
  title: 'Users',
}

const { ListPage, List } = createCRUDComponents(options)
export const UsersList = List

export default ListPage
