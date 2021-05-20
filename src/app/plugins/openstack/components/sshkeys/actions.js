import ApiClient from 'api-client/ApiClient'
import uuid from 'uuid'
import createCRUDActions from 'core/helpers/createCRUDActions'
import Bugsnag from '@bugsnag/js'
import { trackEvent } from 'utils/tracking'

export const sshCacheKey = 'sshKeys'

const { nova } = ApiClient.getInstance()

const injectIds = (x) => ({ ...x, id: x.id || uuid.v4() })

const sshKeyActions = createCRUDActions(sshCacheKey, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get ssh keys')
    const result = (await nova.getSshKeys()).map(injectIds)
    return result
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create ssh key', data)
    const result = await nova.createSshKey(data)
    trackEvent('Create SSH Key', data)
    return result
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete ssh key', { id })
    await nova.deleteSshKey(id)
    trackEvent('Delete SSH Key', { id })
  },
})

export default sshKeyActions
