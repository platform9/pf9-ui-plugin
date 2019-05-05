import yaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import clusterContextLoader from 'core/helpers/clusterContextLoader'
import clusterContextUpdater from 'core/helpers/clusterContextUpdater'

const createClusterizedCRUDActions = options => createCRUDActions({
  ...options,
  customContextLoader: clusterContextLoader,
  customContextUpdater: clusterContextUpdater,
})
const podCRUDActions = createClusterizedCRUDActions({ service: 'qbert', entity: 'pods' })
const deploymentCRUDActions = createClusterizedCRUDActions({
  service: 'qbert',
  entity: 'deployments',
})
const serviceCRUDActions = createClusterizedCRUDActions({
  service: 'qbert',
  entity: 'services',
  dataKey: 'kubeServices',
})

export const loadPods = podCRUDActions.list
export const loadDeployments = deploymentCRUDActions.list
export const loadServices = serviceCRUDActions.list

export const createPod = clusterContextUpdater('pods', async ({ params, context, setContext }) => {
  const { clusterId, namespace, podYaml } = params
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
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
  return [...existing, converted]
}, true)

export const deletePod = clusterContextUpdater('pods', async ({ id, context }) => {
  const { clusterId, namespace, name } = await context.pods.find(x => x.id === id)
  await context.apiClient.qbert.deletePod(clusterId, namespace, name)
  return context.pods.filter(x => x.id !== id)
})

export const createDeployment = clusterContextUpdater('deployments', async ({ params, context, setContext }) => {
  const { clusterId, namespace, deploymentYaml } = params
  const body = yaml.safeLoad(deploymentYaml)
  const existing = await loadDeployments({ params: { clusterId }, context, setContext })
  const created = await context.apiClient.qbert.createDeployment(clusterId, namespace, body)
  const converted = {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
  // Also need to refresh list of pods
  await loadPods({ params: { clusterId }, context, setContext, reload: true })
  return [...existing, converted]
}, true)

export const createService = clusterContextUpdater('kubeServices', async ({ params, context, setContext }) => {
  const { clusterId, namespace, serviceYaml } = params
  const body = yaml.safeLoad(serviceYaml)
  const existing = await loadServices({ params: { clusterId }, context, setContext })
  const created = await context.apiClient.qbert.createService(clusterId, namespace, body)
  const converted = {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
  return [...existing, converted]
}, true)

export const deleteService = clusterContextUpdater('kubeServices', async ({ params: { id }, context }) => {
  const { clusterId, namespace, name } = await context.kubeServices.find(x => x.id === id)
  await context.apiClient.qbert.deleteService(clusterId, namespace, name)
  return context.kubeServices.filter(x => x.id !== id)
})
