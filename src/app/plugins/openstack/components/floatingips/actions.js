import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

const { neutron } = ApiClient.getInstance()

const floatingIpActions = createCRUDActions('floatingIps', {
  listFn: async () => {
    return neutron.getFloatingIps()
  },
  createFn: async data => {
    return neutron.createFloatingIp(data)
  },
  deleteFn: async ({ id }) => {
    await neutron.deleteFloatingIp(id)
  },
  updateFn: async data => {
    throw new Error('Update Floating IP not yet implemented')
  }
})

export default floatingIpActions
