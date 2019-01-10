import yaml from 'js-yaml'

export const loadPods = async ({ clusterId, context, setContext, reload }) => {
  if (!reload && context.pods) { return context.pods }
  const existing = await context.apiClient.qbert.getClusterPods(clusterId)
  setContext({ pods: existing })
  return existing
}

export const createPod = async ({ data, context, setContext }) => {
  const { clusterId, namespace, podYaml } = data
  const body = yaml.safeLoad(podYaml)
  const existing = await loadPods({ clusterId, context, setContext })
  const created = await context.apiClient.qbert.createPod(clusterId, namespace, body)
  // This conversion happens normally at the api client level
  // Need to think of better way to handle this conversion globally for
  // kubernetes resources
  const converted = {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid
  }
  setContext({ pods: [ ...existing, converted ] })
  return created
}

export const deletePod = async ({ id, context, setContext }) => {
  const { clusterId, namespace, name } = await context.pods.find(x => x.id === id)
  await context.apiClient.qbert.deletePod(clusterId, namespace, name)
  const newList = context.pods.filter(x => x.id !== id)
  setContext({ pods: newList })
}

export const loadDeployments = async ({ clusterId, context, setContext, reload }) => {
  if (!reload && context.deployments) { return context.deployments }
  const existing = await context.apiClient.qbert.getClusterDeployments(clusterId)
  setContext({ deployments: existing })
  return existing
}

export const createDeployment = async ({ data, context, setContext }) => {
  const { clusterId, name } = data
  const body = { metadata: { name } }
  const created = await context.apiClient.qbert.createDeployment(clusterId, body)
  setContext({ deployments: [ ...context.deployments, created ] })
  return created
}

export const loadServices = async ({ clusterId, context, setContext, reload }) => {
  if (!reload && context.services) { return context.services }
  const existing = await context.apiClient.qbert.getClusterKubeServices(clusterId)
  setContext({ services: existing })
  return existing
}

export const createService = async ({ data, context, setContext }) => {
  const { clusterId, name } = data
  const body = { metadata: { name } }
  const created = await context.apiClient.qbert.createService(clusterId, body)
  setContext({ services: [ ...context.services, created ] })
  return created
}

export const deleteService = async ({ id, context, setContext }) => {
  const { clusterId, namespace, name } = await context.services.find(x => x.id === id)
  await context.apiClient.qbert.deleteService(clusterId, namespace, name)
  const newList = context.services.filter(x => x.id !== id)
  setContext({ services: newList })
}
