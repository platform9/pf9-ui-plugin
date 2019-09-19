import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'

export const usersCacheKey = 'users'

const { keystone } = ApiClient.getInstance()

const userActions = createCRUDActions(usersCacheKey, {
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
