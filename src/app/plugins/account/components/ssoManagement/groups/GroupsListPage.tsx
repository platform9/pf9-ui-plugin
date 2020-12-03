import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { ActionDataKeys } from 'k8s/DataKeys'
import { mngmGroupActions } from 'account/components/ssoManagement/groups/actions'
import { routes } from 'core/utils/routes'

export const options = {
  columns: [
    { id: 'id', label: 'OpenStack ID', display: false },
    { id: 'name', label: 'Group Name' },
    { id: 'description', label: 'Description' },
    { id: 'samlAttributesString', label: 'SAML Attributes Mapped' },
  ],
  cacheKey: ActionDataKeys.ManagementGroups,
  customEditUrlFn: (_, id) => routes.sso.editGroup.path({ id }),
  editUrl: true,
  name: 'Groups',
  title: 'Groups',
  uniqueIdentifier: 'id',
  addUrl: routes.sso.addGroup.path(),
  addText: 'New Group',
  loaderFn: mngmGroupActions.list,
}

const { ListPage: GroupsListPage } = createCRUDComponents(options)

export default GroupsListPage
