export const createNamespace = async ({ data, context, setContext }) => {
  const { clusterId, name } = data
  const body = { metadata: { name } }
  const created = await context.apiClient.qbert.createNamespace(clusterId, body)
  setContext({ namespaces: [ ...context.namespaces, created ] })
  return created
}

export const deleteNamespace = async ({ id, context, setContext }) => {
  const { clusterId, name } = await context.namespaces.find(x => x.id === id)
  await context.apiClient.qbert.deleteNamespace(clusterId, name)
  const newList = context.namespaces.filter(x => x.id !== id)
  setContext({ namespaces: newList })
}
