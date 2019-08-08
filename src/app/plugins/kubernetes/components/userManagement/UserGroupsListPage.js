import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { loadGroups, deleteGroup } from 'k8s/components/userManagement/actions'

export const options = {
  loaderFn: loadGroups,
  columns: [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'name', label: 'Group Name' },
    { id: 'description', label: 'Description' },
    { id: 'samlAttributesString', label: 'SAML Attributes Mapped' },
  ],
  dataKey: 'groups',
  // editUrl: '/ui/kubernetes/infrastructure/groups/edit',
  deleteFn: deleteGroup,
  name: 'Groups',
  title: 'Groups',
  uniqueIdentifier: 'id',
}

const { ListPage: UserGroupsListPage } = createCRUDComponents(options)

export default UserGroupsListPage
