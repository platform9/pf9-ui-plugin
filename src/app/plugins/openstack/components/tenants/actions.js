import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const tenantsDataKey = 'tenants'
export const userTenantsDataKey = 'userTenants'

const { keystone } = ApiClient.getInstance()

export const loadUserTenants = createContextLoader(userTenantsDataKey, async () => {
  return keystone.getProjectsAuth()
})

const tenantActions = createCRUDActions(tenantsDataKey, {
  listFn: async () => keystone.getProjects(),
  createFn: async data => {
    return keystone.createTenant(data)
  },
  updateFn: async data => {
    const { id } = data
    return keystone.updateTenant(id, data)
  },
  deleteFn: async ({ id }) => {
    await keystone.deleteTenant(id)
  }
})

export default tenantActions
