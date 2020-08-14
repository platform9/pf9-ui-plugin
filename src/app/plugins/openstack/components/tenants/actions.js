import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { trackEvent } from 'utils/tracking'

export const tenantsCacheKey = 'tenants'
export const userTenantsCacheKey = 'userTenants'

const { keystone } = ApiClient.getInstance()

export const loadUserTenants = createContextLoader(userTenantsCacheKey, async () => {
  return keystone.getProjectsAuth()
})

const tenantActions = createCRUDActions(tenantsCacheKey, {
  listFn: async () => keystone.getProjects(),
  createFn: async (data) => {
    const created = await keystone.createTenant(data)
    trackEvent('Create Tenant', {
      id: created.id,
      name: created.name,
    })
    return created
  },
  updateFn: async (data) => {
    const { id } = data
    const tenant = keystone.updateTenant(id, data)
    trackEvent('Update Tenant', {
      id: tenant.id,
      name: tenant.name,
    })
    return result
  },
  deleteFn: async ({ id }) => {
    const result = await keystone.deleteTenant(id)
    trackEvent('Delete Tenant', { id })
    return result
  },
})

export default tenantActions
