import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { trackEvent } from 'utils/tracking'

const { keystone } = ApiClient.getInstance()

const actions = {
  updateUserPassword: async ({ oldPassword, confirmPassword, userId }) => {
    Bugsnag.leaveBreadcrumb('Attempting to update user password', { userId })
    const body = { original_password: oldPassword, password: confirmPassword }
    const result = keystone.updateUserPassword(userId, body)
    trackEvent('Update User Password', { userId })
    return result
  },
}

export default actions
