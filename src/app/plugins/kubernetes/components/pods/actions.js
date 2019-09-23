import yaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import ApiClient from 'api-client/ApiClient'
import { parseClusterParams } from 'k8s/components/infrastructure/actions'
import { allKey } from 'app/constants'
import { pluck } from 'ramda'
import { flatMapAsync } from 'utils/async'

const { qbert } = ApiClient.getInstance()

export const deploymentsCacheKey = 'deployments'
export const kubeServicesCacheKey = 'kubeServices'
export const podsCacheKey = 'pods'

export const deploymentActions = createCRUDActions(deploymentsCacheKey, {
  createFn: async ({ clusterId, namespace, deploymentYaml }) => {
    const body = yaml.safeLoad(deploymentYaml)
    const created = await qbert.createDeployment(clusterId, namespace, body)
    // Also need to refresh the list of pods
    podActions.invalidateCache()
    return {
      ...created,
      clusterId,
      name: created.metadata.name,
      created: created.metadata.creationTimestamp,
      id: created.metadata.uid,
      namespace: created.metadata.namespace,
    }
  },
  service: 'qbert',
  entity: deploymentsCacheKey,
  indexBy: 'clusterId',
})

export const serviceActions = createCRUDActions(kubeServicesCacheKey, {
  createFn: async ({ clusterId, namespace, serviceYaml }) => {
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
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
    await qbert.deleteService(clusterId, namespace, name)
  },
  service: 'qbert',
  entity: 'services',
  cacheKey: kubeServicesCacheKey,
  indexBy: 'clusterId',
})

export const podActions = createCRUDActions(podsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return flatMapAsync(qbert.getClusterPods, pluck('uuid', clusters))
    }
    return qbert.getClusterPods(clusterId)
  },
  createFn: async ({ clusterId, namespace, podYaml }) => {
    const body = yaml.safeLoad(podYaml)
    return qbert.createPod(clusterId, namespace, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
    await qbert.deletePod(clusterId, namespace, name)
  },
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
})
