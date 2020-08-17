import createCRUDComponents from 'core/helpers/createCRUDComponents'
import DataKeys from 'k8s/DataKeys'

export const options = {
  columns: [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'name', label: 'Group Name' },
    { id: 'description', label: 'Description' },
    { id: 'samlAttributesString', label: 'SAML Attributes Mapped' },
  ],
  cacheKey: DataKeys.ManagementGroups,
  // editUrl: '/ui/kubernetes/infrastructure/groups/edit',
  name: 'Groups',
  title: 'Groups',
  uniqueIdentifier: 'id',
}

const { ListPage: UserGroupsListPage } = createCRUDComponents(options)

export default UserGroupsListPage
