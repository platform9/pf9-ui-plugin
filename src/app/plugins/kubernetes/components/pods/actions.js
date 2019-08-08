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

export const createPod = clusterContextUpdater('pods', async ({ params, currentItems, apiClient }) => {
  const { clusterId, namespace, podYaml } = params
  const body = yaml.safeLoad(podYaml)
  const created = await apiClient.qbert.createPod(clusterId, namespace, body)
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
  return [...currentItems, converted]
}, { returnLast: true })

export const deletePod = clusterContextUpdater('pods', async ({ id, apiClient, currentItems }) => {
  const { clusterId, namespace, name } = await context.pods.find(x => x.id === id)
  await apiClient.qbert.deletePod(clusterId, namespace, name)
  return currentItems.filter(x => x.id !== id)
})

export const createDeployment = clusterContextUpdater('deployments', async ({ apiClient, currentItems, params, loadFromContext }) => {
  const { clusterId, namespace, deploymentYaml } = params
  const body = yaml.safeLoad(deploymentYaml)
  const created = await apiClient.qbert.createDeployment(clusterId, namespace, body)
  const converted = {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
  // Also need to refresh list of pods
  await loadFromContext('pods', { params: { clusterId }, reload: true })
  return [...currentItems, converted]
}, { returnLast: true })

export const createService = clusterContextUpdater('kubeServices', async ({ params, currentItems, apiClient }) => {
  const { clusterId, namespace, serviceYaml } = params
  const body = yaml.safeLoad(serviceYaml)
  const created = await apiClient.qbert.createService(clusterId, namespace, body)
  const converted = {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
  return [...currentItems, converted]
}, { returnLast: true })

export const deleteService = clusterContextUpdater('kubeServices', async ({ params: { id }, currentItems, apiClient }) => {
  const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
  await apiClient.qbert.deleteService(clusterId, namespace, name)
  return currentItems.filter(x => x.id !== id)
})
