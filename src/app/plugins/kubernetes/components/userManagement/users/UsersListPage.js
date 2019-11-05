import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { mngmUsersCacheKey } from 'k8s/components/userManagement/users/actions'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'

export const options = {
  columns: [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'username', label: 'Username' },
    { id: 'displayname', label: 'Display Name' },
    { id: 'twoFactor', label: 'Two-Factor Authentication' },
    { id: 'tenants', label: 'Tenants' },
  ],
  cacheKey: mngmUsersCacheKey,
  addText: 'Create a new User',
  addUrl: pathJoin(k8sPrefix, 'user_management/users/add'),
  editUrl: pathJoin(k8sPrefix, 'user_management/users/edit'),
  name: 'Users',
  title: 'Users',
  uniqueIdentifier: 'id',
  searchTarget: 'username',
  multiSelection: false,
}

const { ListPage: UsersListPage } = createCRUDComponents(options)

export default UsersListPage
