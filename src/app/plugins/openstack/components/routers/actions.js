import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const routersDataKey = 'routers'

const { neutron } = ApiClient.getInstance()

const routerActions = createCRUDActions(routersDataKey, {
  listFn: async () => {
    return neutron.getRouters()
  },
  createFn: async data => {
    return neutron.createRouter(data)
  },
  updateFn: async data => {
    const { id } = data
    return neutron.updateRouter(id, data)
  },
  deleteFn: async ({ id }) => {
    await neutron.deleteRouter(id)
  }
})

export default routerActions
