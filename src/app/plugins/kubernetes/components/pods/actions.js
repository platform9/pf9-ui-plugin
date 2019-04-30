import yaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { withCluster } from 'core/helpers/withCluster'
import contextUpdater from 'core/helpers/contextUpdater'

const podCRUDActions = createCRUDActions({ service: 'qbert', entity: 'pods' })
const deploymentCRUDActions = createCRUDActions({ service: 'qbert', entity: 'deployments' })
const serviceCRUDActions = createCRUDActions({
  service: 'qbert',
  entity: 'services',
  dataKey: 'kubeServices',
})

export const loadPods = withCluster(podCRUDActions.list)
export const loadDeployments = withCluster(deploymentCRUDActions.list)
export const loadServices = withCluster(serviceCRUDActions.list)

export const createPod = contextUpdater('pods', async ({ data, context, setContext }) => {
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
    id: created.metadata.uid,
    namespace: created.metadata.namespace,
  }
  return [...existing, converted]
}, true)

export const deletePod = contextUpdater('pods', async ({ id, context }) => {
  const { clusterId, namespace, name } = await context.pods.find(x => x.id === id)
  await context.apiClient.qbert.deletePod(clusterId, namespace, name)
  return context.pods.filter(x => x.id !== id)
})

export const createDeployment = contextUpdater('deployments', async ({ data, context, setContext }) => {
  const { clusterId, namespace, deploymentYaml } = data
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

export const createService = contextUpdater('kubeServices', async ({ data, context, setContext }) => {
  const { clusterId, namespace, serviceYaml } = data
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

export const deleteService = contextUpdater('kubeServices', async ({ id, context }) => {
  const { clusterId, namespace, name } = await context.kubeServices.find(x => x.id === id)
  await context.apiClient.qbert.deleteService(clusterId, namespace, name)
  return context.kubeServices.filter(x => x.id !== id)
})
