import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

const dataKey = 'tenants'

export const loadUserTenants = contextLoader('userTenants', async ({ apiClient }) => {
  return apiClient.keystone.getProjectsAuth()
})

export const loadTenants = contextLoader(dataKey, async ({ apiClient }) => {
  return apiClient.keystone.getProjects()
})

export const createTenant = contextUpdater(dataKey, async ({ data, apiClient, currentItems }) => {
  const created = await apiClient.keystone.createTenant(data)
  return [...currentItems, created]
}, { returnLast: true })

export const deleteTenant = contextUpdater(dataKey, async ({ id, apiClient, currentItems }) => {
  await apiClient.keystone.deleteTenant(id)
  return currentItems.filter(x => x.id !== id)
})

export const updateTenant = contextUpdater(dataKey, async ({ data, apiClient, currentItems }) => {
  const { id } = data
  const updated = await apiClient.keystone.updateTenant(id, data)
  return currentItems.map(x => x.id === id ? x : updated)
})
