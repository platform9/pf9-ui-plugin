import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const loadFloatingIps = contextLoader('floatingIps', async ({ apiClient }) => {
  return apiClient.neutron.getFloatingIps()
})

export const createFloatingIp = contextUpdater('floatingIps', async ({ apiClient, data }) => {
  const existing = await apiClient.neutron.getFloatingIps()
  const created = await apiClient.neutron.createFloatingIp(data)
  return [...existing, created]
}, true)

export const deleteFloatingIp = contextUpdater('floatingIps', async ({ apiClient, id, currentItems }) => {
  await apiClient.neutron.deleteFloatingIp(id)
  return currentItems.filter(x => x.id !== id)
})

export const updateFloatingIp = contextUpdater('floatingIps', async ({ apiClient, loadFromContext, data }) => {
  console.error('TODO: Update Floating IP not yet implemented')
  /*
  const { id } = data
  const existing = await loadFloatingIps({ context, setContext })
  const updated = await apiClient.neutron.updateFloatingIp(id, data)
  const newList = existing.map(x => x.id === id ? x : updated)
  setContext({ floatingIps: newList })
  */
})
