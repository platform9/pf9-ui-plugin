import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const loadFloatingIps = contextLoader('floatingIps', async ({ context }) => {
  return context.apiClient.neutron.getFloatingIps()
})

export const createFloatingIp = contextUpdater('floatingIps', async ({ data, context }) => {
  const existing = await context.apiClient.neutron.getFloatingIps()
  const created = await context.apiClient.neutron.createFloatingIp(data)
  return [...existing, created]
}, true)

export const deleteFloatingIp = contextUpdater('floatingIps', async ({ id, context }) => {
  await context.apiClient.neutron.deleteFloatingIp(id)
  return context.floatingIps.filter(x => x.id !== id)
})

export const updateFloatingIp = contextUpdater('floatingIps', async ({ data, context, setContext }) => {
  console.error('TODO: Update Floating IP not yet implemented')
  /*
  const { id } = data
  const existing = await loadFloatingIps({ context, setContext })
  const updated = await context.apiClient.neutron.updateFloatingIp(id, data)
  const newList = existing.map(x => x.id === id ? x : updated)
  setContext({ floatingIps: newList })
  */
})
