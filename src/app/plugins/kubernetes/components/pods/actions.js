import yaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import createContextUpdater from 'core/helpers/createContextUpdater'
import ApiClient from 'api-client/ApiClient'

export const podsDataKey = 'pods'
export const kubeServicesDataKey = 'kubeServices'
export const deploymentsDataKey = 'deployments'

const podCRUDActions = createCRUDActions({
  service: 'qbert',
  entity: podsDataKey,
  operations: ['list'],
})
const deploymentCRUDActions = createCRUDActions({
  service: 'qbert',
  entity: deploymentsDataKey,
  operations: ['list'],
})
const serviceCRUDActions = createCRUDActions({
  service: 'qbert',
  entity: 'services',
  dataKey: kubeServicesDataKey,
  operations: ['list'],
})

export const loadPods = podCRUDActions.list
export const loadDeployments = deploymentCRUDActions.list
export const loadServices = serviceCRUDActions.list

export const createPod = createContextUpdater(podsDataKey, async ({ clusterId, namespace, podYaml }) => {
  const { qbert } = ApiClient.getInstance()
  const body = yaml.safeLoad(podYaml)
  const created = await qbert.createPod(clusterId, namespace, body)
  // This conversion happens normally at the api client level
  // Need to think of better way to handle this conversion globally for
  // kubernetes resources
  return {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
}, { operation: 'create' })

export const deletePod = createContextUpdater(podsDataKey, async ({ id }, currentItems) => {
  const { qbert } = ApiClient.getInstance()
  const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
  await qbert.deletePod(clusterId, namespace, name)
}, { operation: 'delete' })

export const createDeployment = createContextUpdater(deploymentsDataKey, async ({ clusterId, namespace, deploymentYaml }) => {
  const { qbert } = ApiClient.getInstance()
  const body = yaml.safeLoad(deploymentYaml)
  const created = await qbert.createDeployment(clusterId, namespace, body)
  // Also need to refresh the list of pods
  loadPods.invalidateCache()
  return {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
}, {
  operation: 'create',
})

export const createService = createContextUpdater(kubeServicesDataKey, async ({ clusterId, namespace, serviceYaml }) => {
  const { qbert } = ApiClient.getInstance()
  const body = yaml.safeLoad(serviceYaml)
  const created = await qbert.createService(clusterId, namespace, body)
  return {
    ...created,
    clusterId,
    name: created.metadata.name,
    created: created.metadata.creationTimestamp,
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
}, { operation: 'create' })

export const deleteService = createContextUpdater(kubeServicesDataKey, async ({ id },
  currentItems) => {
  const { qbert } = ApiClient.getInstance()
  const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
  await qbert.deleteService(clusterId, namespace, name)
}, { operation: 'delete' })
