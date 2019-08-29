import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const usersDataKey = 'users'

const { keystone } = ApiClient.getInstance()

const userActions = createCRUDActions(usersDataKey, {
  listFn: async () => {
    return keystone.getUsers()
  },
  createFn: async ({ data }) => {
    return keystone.createUser(data)
  },
  deleteFn: async ({ id }) => {
    await keystone.deleteUser(id)
  },
})

export default userActions
