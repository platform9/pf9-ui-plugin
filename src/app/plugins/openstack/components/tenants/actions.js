import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import ApiClient from 'api-client/ApiClient'

const tenantsContextKey = 'tenants'

export const loadUserTenants = createContextLoader('userTenants', async () => {
  const { keystone } = ApiClient.getInstance()
  return keystone.getProjectsAuth()
})

export const loadTenants = createContextLoader(tenantsContextKey, async () => {
  const { keystone } = ApiClient.getInstance()
  return keystone.getProjects()
})

export const createTenant = createContextUpdater(tenantsContextKey, async data => {
  const { keystone } = ApiClient.getInstance()
  return keystone.createTenant(data)
}, { operation: 'create' })

export const deleteTenant = createContextUpdater(tenantsContextKey, async ({ id }) => {
  const { keystone } = ApiClient.getInstance()
  await keystone.deleteTenant(id)
}, { operation: 'delete' })

export const updateTenant = createContextUpdater(tenantsContextKey, async data => {
  const { keystone } = ApiClient.getInstance()
  const { id } = data
  return keystone.updateTenant(id, data)
}, { operation: 'update' })
