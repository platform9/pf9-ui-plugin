import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { mngmUsersCacheKey } from 'k8s/components/userManagement/users/actions'

export const options = {
  columns: [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'username', label: 'Username' },
    { id: 'displayname', label: 'Display Name' },
    { id: 'twoFactor', label: 'Two-Factor Authentication' },
    { id: 'tenants', label: 'Tenants' },
  ],
  cacheKey: mngmUsersCacheKey,
  // editUrl: '/ui/kubernetes/infrastructure/users/edit',
  name: 'Users',
  title: 'Users',
  uniqueIdentifier: 'id',
  searchTarget: 'username',
}

const { ListPage: UsersListPage } = createCRUDComponents(options)

export default UsersListPage
