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

export const loadNodes = async ({ context, setContext, reload }) => {
  if (!reload && context.nodes) { return context.nodes }
  // TODO: Get nodes is not yet implemented
  // const nodes = await context.apiClient.qbert.getNodes()
  const nodes = []
  setContext({ nodes })
  return nodes
}
