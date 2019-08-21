import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'

export const loadUsers = createContextLoader('users', async () => {
  const { keystone } = ApiClient.getInstance()
  return keystone.getUsers()
})

export const createUser = createContextUpdater('users', async ({ data }) => {
  const { keystone } = ApiClient.getInstance()
  return keystone.createUser(data)
}, {
  operation: 'create'
})

export const deleteUser = createContextUpdater('users', async ({ id }) => {
  const { keystone } = ApiClient.getInstance()
  await keystone.deleteUser(id)
}, {
  operation: 'delete'
})

export const updateUser = () => {
  // TODO
}
