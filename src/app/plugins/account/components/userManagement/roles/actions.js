import createCRUDActions from 'core/helpers/createCRUDActions'
import ApiClient from 'api-client/ApiClient'
import { makeManagementRolesSelector } from 'account/components/userManagement/roles/selectors'
import { ActionDataKeys } from 'k8s/DataKeys'

const { keystone } = ApiClient.getInstance()

export const mngmRoleActions = createCRUDActions(ActionDataKeys.ManagementRoles, {
  listFn: async () => {
    return keystone.getRoles()
  },
  entityName: 'Role',
  selectorCreator: makeManagementRolesSelector,
})
