export const loadUsers = async ({ context, setContext, reload }) => {
  if (!reload && context.users) { return context.users }
  const users = await context.apiClient.keystone.getUsers()
  setContext({ users })
  return users
}

export const createUser = async ({ data, context, setContext }) => {
  const created = await context.apiClient.keystone.createUser(data)
  const existing = await context.apiClient.keystone.getUsers()
  setContext({ users: [ ...existing, created ] })
  return created
}

export const deleteUser = async ({ id, context, setContext }) => {
  await context.apiClient.keystone.deleteUser(id)
  const newList = context.users.filter(x => x.id !== id)
  setContext({ users: newList })
}
