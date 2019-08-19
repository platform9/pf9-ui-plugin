import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'

export const loadNetworks = createContextLoader('networks', async () => {
  const { neutron } = ApiClient.getInstance()
  return neutron.getNetworks()
})

export const createNetwork = createContextUpdater('networks', async data => {
  const { neutron } = ApiClient.getInstance()
  return neutron.createNetwork(data)
}, { operation: 'create' })

export const deleteNetwork = createContextUpdater('networks', async ({ id }) => {
  const { neutron } = ApiClient.getInstance()
  await neutron.deleteNetwork(id)
}, { operation: 'delete' })

export const updateNetwork = createContextUpdater('networks', async data => {
  const { id } = data
  const { neutron } = ApiClient.getInstance()
  return neutron.updateNetwork(id, data)
}, { operation: 'update' })
