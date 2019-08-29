import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const networksDataKey = 'networks'

const { neutron } = ApiClient.getInstance()

const networkActions = createCRUDActions(networksDataKey, {
  listFn: async () => {
    return neutron.getNetworks()
  },
  createFn: async data => {
    return neutron.createNetwork(data)
  },
  updateFn: async data => {
    const { id } = data
    return neutron.updateNetwork(id, data)
  },
  deleteFn: async ({ id }) => {
    await neutron.deleteNetwork(id)
  },
})

export default networkActions
