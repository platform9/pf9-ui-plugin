import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const loadRouters = contextLoader('routers', async ({ context }) => {
  return context.apiClient.neutron.getRouters()
})

export const createRouter = contextUpdater('routers', async ({ data, context }) => {
  const existing = await context.apiClient.neutron.getRouters()
  const created = await context.apiClient.neutron.createRouter(data)
  return [...existing, created]
}, true)

export const deleteRouter = contextUpdater('routers', async ({ id, context }) => {
  await context.apiClient.neutron.deleteRouter(id)
  return context.routers.filter(x => x.id !== id)
})

export const updateRouter = contextUpdater('routers', async ({ data, context }) => {
  const { id } = data
  const existing = await context.apiClient.neutron.getRouters()
  const updated = await context.apiClient.neutron.updateRouter(id, data)
  return existing.map(x => x.id === id ? x : updated)
})
