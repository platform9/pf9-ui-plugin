import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { trackEvent } from 'utils/tracking'

export const subnetsCacheKey = 'subnets'

const { neutron } = ApiClient.getInstance()

export const createSubnet = (body) => neutron.createSubnet(body)

const subnetActions = createCRUDActions(subnetsCacheKey, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get subnets')
    return neutron.getSubnets()
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create subnet', data)
    const result = await neutron.createSubnet(data)
    trackEvent('Create Subnet', data)
    return result
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
