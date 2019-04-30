import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const loadNetworks = contextLoader('networks', async ({ context }) => {
  return context.apiClient.neutron.getNetworks()
})

export const createNetwork = contextUpdater('networks', async ({ data, context }) => {
  const existing = await context.apiClient.neutron.getNetworks()
  const created = await context.apiClient.neutron.createNetwork(data)
  return [...existing, created]
}, true)

export const deleteNetwork = contextUpdater('networks', async ({ id, context }) => {
  await context.apiClient.neutron.deleteNetwork(id)
  return context.networks.filter(x => x.id !== id)
})

export const updateNetwork = contextUpdater('networks', async ({ data, context }) => {
  const { id } = data
  const existing = await context.apiClient.neutron.getNetworks()
  const updated = await context.apiClient.neutron.updateNetwork(id, data)
  return existing.map(x => x.id === id ? x : updated)
})
