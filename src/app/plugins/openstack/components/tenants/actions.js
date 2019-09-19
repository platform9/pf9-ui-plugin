import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const tenantsCacheKey = 'tenants'
export const userTenantsCacheKey = 'userTenants'

const { keystone } = ApiClient.getInstance()

export const loadUserTenants = createContextLoader(userTenantsCacheKey, async () => {
  return keystone.getProjectsAuth()
})

const tenantActions = createCRUDActions(tenantsCacheKey, {
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
