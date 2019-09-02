import yaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import ApiClient from 'api-client/ApiClient'
import { parseClusterParams } from 'k8s/components/infrastructure/actions'
import { allKey } from 'app/constants'
import { asyncFlatMap } from 'utils/fp'
import { pluck } from 'ramda'

const { qbert } = ApiClient.getInstance()

export const deploymentsDataKey = 'deployments'
export const kubeServicesDataKey = 'kubeServices'
export const podsDataKey = 'pods'

export const deploymentActions = createCRUDActions(deploymentsDataKey, {
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
  entity: deploymentsDataKey,
  indexBy: 'clusterId',
})

export const serviceActions = createCRUDActions(kubeServicesDataKey, {
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
  dataKey: kubeServicesDataKey,
  indexBy: 'clusterId',
})

export const podActions = createCRUDActions(podsDataKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return asyncFlatMap(pluck('uuid', clusters), qbert.getClusterPods)
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
