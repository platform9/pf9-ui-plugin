export const loadClusters = async ({ context, setContext, reload }) => {
  if (!reload && context.clusters) { return context.clusters }
  const clusters = await context.apiClient.qbert.getClusters()
  setContext({ clusters })
  return clusters
}

export const loadCloudProviders = async ({ context, setContext, reload }) => {
  if (!reload && context.cloudProviders) { return context.cloudProviders }
  const cloudProviders = await context.apiClient.qbert.getCloudProviders()
  setContext({ cloudProviders })
  return cloudProviders
}

export const createCloudProvider = async ({ data, context, setContext }) => {
  const created = await context.apiClient.qbert.createCloudProvider(data)
  const existing = await context.apiClient.qbert.getCloudProviders()
  setContext({ cloudProviders: [ ...existing, created ] })
  return created
}

export const deleteCloudProvider = async ({ id, context, setContext }) => {
  await context.apiClient.qbert.deleteCloudProvider(id)
  const newCps = context.cloudProviders.filter(x => x.id !== id)
  setContext({ cloudProviders: newCps })
}

export const loadNodes = async ({ context, setContext, reload }) => {
  if (!reload && context.nodes) { return context.nodes }
  // TODO: Get nodes is not yet implemented
  // const nodes = await context.apiClient.qbert.getNodes()
  const nodes = []
  setContext({ nodes })
  return nodes
}
