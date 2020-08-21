import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { ActionDataKeys } from 'k8s/DataKeys'

export const options = {
  headlessTable: true,
  compactTable: true,
  columns: [
    { id: 'name', label: 'Role' },
    { id: 'description', label: 'Description' },
  ],
  cacheKey: ActionDataKeys.ManagementRoles,
  // editUrl: '/ui/kubernetes/infrastructure/roles/edit',
  name: 'Roles',
  title: 'Roles',
  uniqueIdentifier: 'id',
  showCheckboxes: false,
}

const { ListPage: UserRolesListPage } = createCRUDComponents(options)

export default UserRolesListPage
