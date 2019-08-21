import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'

export const loadFloatingIps = createContextLoader('floatingIps', async () => {
  const { neutron } = ApiClient.getInstance()
  return neutron.getFloatingIps()
})

export const createFloatingIp = createContextUpdater('floatingIps', async data => {
  const { neutron } = ApiClient.getInstance()
  return neutron.createFloatingIp(data)
}, { operation: 'create' })

export const deleteFloatingIp = createContextUpdater('floatingIps', async ({ id }) => {
  const { neutron } = ApiClient.getInstance()
  await neutron.deleteFloatingIp(id)
}, { operation: 'delete' })

export const updateFloatingIp = createContextUpdater('floatingIps', async data => {
  console.error('TODO: Update Floating IP not yet implemented')
})
