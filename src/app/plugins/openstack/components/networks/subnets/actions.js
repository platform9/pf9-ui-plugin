import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const subnetsCacheKey = 'subnets'

const { neutron } = ApiClient.getInstance()

export const createSubnet = (body) => (
  neutron.createSubnet(body)
)

const subnetActions = createCRUDActions(subnetsCacheKey, {
  listFn: async () => {
    return neutron.getSubnets()
  },
  createFn: async (data) => {
    return neutron.createSubnet(data)
  },
  // updateFn: async (data) => {
  //   const { id } = data
  //   return neutron.updateSubnet(id, data)
  // },
  // deleteFn: async ({ id }) => {
  //   await neutron.deleteSubnet(id)
  // },
})

export default subnetActions
