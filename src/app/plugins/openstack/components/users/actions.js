import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { trackEvent } from 'utils/tracking'

export const usersCacheKey = 'users'

const { keystone } = ApiClient.getInstance()

const userActions = createCRUDActions(usersCacheKey, {
  listFn: async () => {
    return keystone.getUsers()
  },
  createFn: async ({ data }) => {
    const user = await keystone.createUser(data)
    trackEvent('Create User', {
      id: user.id,
      name: user.name,
    })
    return user
  },
  deleteFn: async ({ id }) => {
    const result = await keystone.deleteUser(id)
    trackEvent('Delete User', { id })
    return result
  },
})

export default userActions
