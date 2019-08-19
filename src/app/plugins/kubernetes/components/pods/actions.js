import yaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import createContextUpdater from 'core/helpers/createContextUpdater'
import ApiClient from 'api-client/ApiClient'

const podCRUDActions = createCRUDActions({ service: 'qbert', entity: 'pods' })
const deploymentCRUDActions = createCRUDActions({
  service: 'qbert',
  entity: 'deployments',
})
const serviceCRUDActions = createCRUDActions({
  service: 'qbert',
  entity: 'services',
  dataKey: 'kubeServices',
})

export const loadPods = podCRUDActions.list
export const loadDeployments = deploymentCRUDActions.list
export const loadServices = serviceCRUDActions.list

export const createPod = createContextUpdater('pods', async ({ clusterId, namespace, podYaml }) => {
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

export const deletePod = createContextUpdater('pods', async ({ id }, currentItems) => {
  const { qbert } = ApiClient.getInstance()
  const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
  await qbert.deletePod(clusterId, namespace, name)
}, { operation: 'delete' })

export const createDeployment = createContextUpdater('deployments', async ({ clusterId, namespace, deploymentYaml }) => {
  const { qbert } = ApiClient.getInstance()
  const body = yaml.safeLoad(deploymentYaml)
  const created = await qbert.createDeployment(clusterId, namespace, body)
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
  // Also need to refresh the list of pods
  onSuccess: ({ clusterId }) => loadPods({ clusterId }, true)
})

export const createService = createContextUpdater('kubeServices', async ({ clusterId, namespace, serviceYaml }) => {
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

export const deleteService = createContextUpdater('kubeServices', async ({ id }, currentItems) => {
  const { qbert } = ApiClient.getInstance()
  const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
  await qbert.deleteService(clusterId, namespace, name)
}, { operation: 'delete' })
