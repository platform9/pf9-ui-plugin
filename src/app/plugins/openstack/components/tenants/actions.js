import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { trackEvent } from 'utils/tracking'
import Bugsnag from '@bugsnag/js'

export const tenantsCacheKey = 'tenants'
export const userTenantsCacheKey = 'userTenants'

const { keystone } = ApiClient.getInstance()

export const loadUserTenants = createContextLoader(userTenantsCacheKey, async () => {
  Bugsnag.leaveBreadcrumb('Attempting to load user tenants')
  return keystone.getProjectsAuth()
})

const tenantActions = createCRUDActions(tenantsCacheKey, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attemptign to list tenants')
    return keystone.getProjects()
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create tenant', data)
    const created = await keystone.createTenant(data)
    trackEvent('Create Tenant', {
      id: created.id,
      name: created.name,
    })
    return created
  },
  updateFn: async (data) => {
    const { id } = data
    Bugsnag.leaveBreadcrumb('Attempting to update tenant', { id })
    const tenant = keystone.updateTenant(id, data)
    trackEvent('Update Tenant', {
      id: tenant.id,
      name: tenant.name,
    })
    return tenant
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete tenant', { id })
    const result = await keystone.deleteTenant(id)
    trackEvent('Delete Tenant', { id })
    return result
  },
})

export default tenantActions
