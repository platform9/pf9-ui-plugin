import createCRUDActions from 'core/helpers/createCRUDActions'
import ApiClient from 'api-client/ApiClient'
import DataKeys from 'k8s/DataKeys'

const { keystone } = ApiClient.getInstance()

export const mngmRoleActions = createCRUDActions(DataKeys.ManagementRoles, {
  listFn: async () => {
    return keystone.getRoles()
  },
  entityName: 'Role',
})
