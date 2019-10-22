import jsYaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import { pluck, pipe, propEq, map, find, prop, filter } from 'ramda'
import { flatMapAsync, mapAsync } from 'utils/async'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { pathJoin } from 'utils/misc'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'

const { qbert } = ApiClient.getInstance()

export const deploymentsCacheKey = 'deployments'
export const kubeServicesCacheKey = 'kubeServices'
export const podsCacheKey = 'pods'

export const deploymentActions = createCRUDActions(deploymentsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return flatMapAsync(qbert.getClusterDeployments, pluck('uuid', clusters))
    }
    return qbert.getClusterDeployments(clusterId)
  },
  createFn: async ({ clusterId, namespace, yaml }) => {
    const body = jsYaml.safeLoad(yaml)
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
  dataMapper: async (items, { clusterId, namespace }, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    const parsedItems = map(item => ({
      ...item,
      namespace: item.metadata.namespace,
      clusterId,
      clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
    }))(items)

    // Filter by namespace
    return namespace && namespace !== allKey
      ? filter(propEq('namespace', namespace), parsedItems)
      : parsedItems
  },
  service: 'qbert',
  entity: deploymentsCacheKey,
  indexBy: 'clusterId',
})

export const serviceActions = createCRUDActions(kubeServicesCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return flatMapAsync(qbert.getClusterKubeServices, pluck('uuid', clusters))
    }
    return qbert.getClusterKubeServices(clusterId)
  },
  createFn: async ({ clusterId, namespace, yaml }) => {
    const body = jsYaml.safeLoad(yaml)
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
  dataMapper: async (items, { clusterId, namespace }, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    const parsedItems = map(item => ({
      ...item,
      namespace: item.metadata.namespace,
      clusterId,
      clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
    }))(items)

    // Filter by namespace
    return namespace && namespace !== allKey
      ? filter(propEq('namespace', namespace), parsedItems)
      : parsedItems
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
  createFn: async ({ clusterId, namespace, yaml }) => {
    const body = jsYaml.safeLoad(yaml)
    return qbert.createPod(clusterId, namespace, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
    await qbert.deletePod(clusterId, namespace, name)
  },
  dataMapper: async (items, { clusterId, namespace }, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    const parsedItems = await mapAsync(async pod => {
      const dashboardUrl = pathJoin(await qbert.clusterBaseUrl(pod.clusterId),
        'namespaces/kube-system/services/https:kubernetes-dashboard:443/proxy/#/pod',
        pod.metadata.namespace,
        pod.metadata.name,
      )
      return {
        ...pod,
        dashboardUrl,
        namespace: pod.metadata.namespace,
        labels: pod.metadata.labels,
        clusterId,
        clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
      }
    }, items)

    // Filter by namespace
    return namespace && namespace !== allKey
      ? filter(propEq('namespace', namespace), parsedItems)
      : parsedItems
  },
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
})
