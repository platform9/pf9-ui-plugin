import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const networksCacheKey = 'networks'

const { neutron } = ApiClient.getInstance()

// Don't bother with cache with ironic setup wizard
// Wait until cache refactor before changing to proper architecture
export const createNetwork = (body) => (
  neutron.createNetwork(body)
)

export const deleteNetwork = (id) => (
  neutron.deleteNetwork(id)
)

export const networkIpAvailability = (id) => (
  neutron.networkIpAvailability(id)
)

const networkActions = createCRUDActions(networksCacheKey, {
  listFn: async () => {
    return neutron.getNetworks()
  },
  createFn: async (data) => {
    return neutron.createNetwork(data)
  },
  updateFn: async (data) => {
    const { id } = data
    return neutron.updateNetwork(id, data)
  },
  deleteFn: async ({ id }) => {
    await neutron.deleteNetwork(id)
  },
})

export default networkActions
