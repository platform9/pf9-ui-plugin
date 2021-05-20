import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { trackEvent } from 'utils/tracking'

export const networksCacheKey = 'networks'

const { neutron } = ApiClient.getInstance()

// Don't bother with cache with ironic setup wizard
// Wait until cache refactor before changing to proper architecture
export const createNetwork = (body) => {
  Bugsnag.leaveBreadcrumb('Attempting to create network', body)
  trackEvent('Create Network', body)
  return neutron.createNetwork(body)
}

export const deleteNetwork = (id) => {
  Bugsnag.leaveBreadcrumb('Attempting to delete network', { id })
  trackEvent('Delete Network', { id })
  return neutron.deleteNetwork(id)
}

export const networkIpAvailability = (id) => {
  Bugsnag.leaveBreadcrumb('Attempting to get network IP availability', { id })
  return neutron.networkIpAvailability(id)
}

const networkActions = createCRUDActions(networksCacheKey, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get networks')
    return neutron.getNetworks()
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create network', data)
    const result = await neutron.createNetwork(data)
    trackEvent('Create Network', data)
    return result
  },
  updateFn: async (data) => {
    const { id } = data
    Bugsnag.leaveBreadcrumb('Attempting to update network', { id })
    const result = await neutron.updateNetwork(id, data)
    trackEvent('Update Network', { id })
    return result
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete network', { id })
    await neutron.deleteNetwork(id)
    trackEvent('Delete Network', { id })
  },
})

export default networkActions
