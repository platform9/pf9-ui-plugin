import ApiClient from 'api-client/ApiClient'

const { keystone } = ApiClient.getInstance()

const actions = {
  updateUserPassword: async ({ oldPassword, confirmPassword, userId }) => {
    const body = { original_password: oldPassword, password: confirmPassword }
    return keystone.updateUserPassword(userId, body)
  },
}

export default actions
