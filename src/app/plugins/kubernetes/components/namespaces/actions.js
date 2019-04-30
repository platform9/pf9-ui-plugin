import contextUpdater from 'core/helpers/contextUpdater'

export const createNamespace = contextUpdater('namespaces', async ({ data, context }) => {
  const { clusterId, name } = data
  const body = { metadata: { name } }
  const created = await context.apiClient.qbert.createNamespace(clusterId, body)
  return [...context.namespaces, created]
}, true)

export const deleteNamespace = contextUpdater('namespaces', async ({ id, context }) => {
  const { clusterId, name } = await context.namespaces.find(x => x.id === id)
  await context.apiClient.qbert.deleteNamespace(clusterId, name)
  return context.namespaces.filter(x => x.id !== id)
})
