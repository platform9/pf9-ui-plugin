import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const loadUsers = contextLoader('users', async ({ apiClient }) => {
  return apiClient.keystone.getUsers()
})

export const createUser = contextUpdater('users', async ({ data, context }) => {
  const created = await context.apiClient.keystone.createUser(data)
  const existing = await context.apiClient.keystone.getUsers()
  return [ ...existing, created ]
}, { returnLast: true })

export const deleteUser = contextUpdater('users', async ({ id, context }) => {
  await context.apiClient.keystone.deleteUser(id)
  return context.users.filter(x => x.id !== id)
})

export const updateUser = () => {
  // TODO
}
