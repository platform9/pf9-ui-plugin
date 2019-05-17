import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const loadNetworks = contextLoader('networks', async ({ apiClient }) => {
  return apiClient.neutron.getNetworks()
})

export const createNetwork = contextUpdater('networks', async ({ apiClient, currentItems, data }) => {
  const created = await apiClient.neutron.createNetwork(data)
  return [...currentItems, created]
}, { returnLast: true })

export const deleteNetwork = contextUpdater('networks', async ({ apiClient, id, currentItems }) => {
  await apiClient.neutron.deleteNetwork(id)
  return currentItems.filter(x => x.id !== id)
})

export const updateNetwork = contextUpdater('networks', async ({ apiClient, currentItems, data }) => {
  const { id } = data
  const updated = await apiClient.neutron.updateNetwork(id, data)
  return currentItems.map(x => x.id === id ? x : updated)
})
