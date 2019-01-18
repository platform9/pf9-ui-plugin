import yaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'

const podCRUDActions = createCRUDActions({ service: 'qbert', entity: 'pods' })
const deploymentCRUDActions = createCRUDActions({ service: 'qbert', entity: 'deployments' })
const serviceCRUDActions = createCRUDActions({ service: 'qbert', entity: 'services', dataKey: 'kubeServices' })

export const loadPods = podCRUDActions.list
export const loadDeployments = deploymentCRUDActions.list
export const loadServices = serviceCRUDActions.list

export const createPod = async ({ data, context, setContext }) => {
  const { clusterId, namespace, podYaml } = data
  const body = yaml.safeLoad(podYaml)
  const existing = await loadPods({ params: { clusterId }, context, setContext })
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

export const createDeployment = async ({ data, context, setContext }) => {
  const { clusterId, namespace, deploymentYaml } = data
  const body = yaml.safeLoad(deploymentYaml)
  const existing = await loadDeployments({ params: { clusterId }, context, setContext })
  const created = await context.apiClient.qbert.createDeployment(clusterId, namespace, body)
  const converted = {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid
  }
  // Also need to refresh list of pods
  const pods = await loadPods({ params: { clusterId }, context, setContext, reload: true })
  setContext({ deployments: [ ...existing, converted ], pods })
  return created
}

export const createService = async ({ data, context, setContext }) => {
  const { clusterId, namespace, serviceYaml } = data
  const body = yaml.safeLoad(serviceYaml)
  const existing = await loadServices({ params: { clusterId }, context, setContext })
  const created = await context.apiClient.qbert.createService(clusterId, namespace, body)
  const converted = {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid
  }
  setContext({ kubeServices: [ ...existing, converted ] })
  return created
}

export const deleteService = async ({ id, context, setContext }) => {
  const { clusterId, namespace, name } = await context.kubeServices.find(x => x.id === id)
  await context.apiClient.qbert.deleteService(clusterId, namespace, name)
  const newList = context.kubeServices.filter(x => x.id !== id)
  setContext({ kubeServices: newList })
}
