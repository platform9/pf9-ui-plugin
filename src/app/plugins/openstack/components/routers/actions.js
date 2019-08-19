import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'

export const loadRouters = createContextLoader('routers', async () => {
  const { neutron } = ApiClient.getInstance()
  return neutron.getRouters()
})

export const createRouter = createContextUpdater('routers', async data => {
  const { neutron } = ApiClient.getInstance()
  return neutron.createRouter(data)
}, { operation: 'create' })

export const deleteRouter = createContextUpdater('routers', async ({ id }) => {
  const { neutron } = ApiClient.getInstance()
  await neutron.deleteRouter(id)
}, { operation: 'delete' })

export const updateRouter = createContextUpdater('routers', async data => {
  const { neutron } = ApiClient.getInstance()
  const { id } = data
  return neutron.updateRouter(id, data)
}, { operation: 'update' })
