import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

const dataKey = 'tenants'

export const loadUserTenants = contextLoader('userTenants', async ({ context }) => {
  return context.apiClient.keystone.getProjectsAuth()
})

export const loadTenants = contextLoader(dataKey, async ({ context }) => {
  return context.apiClient.keystone.getProjects()
})

export const createTenant = contextUpdater(dataKey, async ({ data, context, setContext }) => {
  const created = await context.apiClient.keystone.createTenant(data)
  const existing = await loadTenants({ context, setContext })
  return [...existing, created]
}, true)

export const deleteTenant = contextUpdater(dataKey, async ({ id, context }) => {
  await context.apiClient.keystone.deleteTenant(id)
  return context[dataKey].filter(x => x.id !== id)
})

export const updateTenant = contextUpdater(dataKey, async ({ data, context, setContext }) => {
  const { id } = data
  const existing = await loadTenants({ context, setContext })
  const updated = await context.apiClient.keystone.updateTenant(id, data)
  return existing.map(x => x.id === id ? x : updated)
})
