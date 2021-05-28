import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { trackEvent } from 'utils/tracking'

const { neutron } = ApiClient.getInstance()

const floatingIpActions = createCRUDActions('floatingIps', {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get floating IPs')
    return neutron.getFloatingIps()
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create floating IP', data)
    const result = await neutron.createFloatingIp(data)
    trackEvent('Create Floating IP', data)
    return result
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete floating IP', { id })
    await neutron.deleteFloatingIp(id)
    trackEvent('Delete Floating IP', { id })
  },
  updateFn: async (data) => {
    throw new Error('Update Floating IP not yet implemented')
  },
})

export default floatingIpActions
