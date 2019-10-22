import jsYaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import { pluck, pipe, propEq, map, find, prop, filter, pathEq, any, toPairs, head } from 'ramda'
import { flatMapAsync, mapAsync } from 'utils/async'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { pathJoin } from 'utils/misc'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'
import { pathStr, filterIf, pathStrOr, emptyObj } from 'utils/fp'

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
    const [clusters, pods] = await Promise.all([
      loadFromContext(clustersCacheKey),
      loadFromContext(podsCacheKey, { clusterId, namespace }),
    ])
    return pipe(
      // Filter by namespace
      filterIf(namespace && namespace !== allKey, pathEq(['metadata', 'namespace'], namespace)),
      map(item => {
        const selectors = pathStrOr(emptyObj, 'spec.selector.matchLabels', item)
        const [labelKey, labelValue] = head(toPairs(selectors))
        const namespace = pathStr('metadata.namespace', item)

        // Check if any pod label matches the first deployment match label key
        // Note: this logic should probably be revised (copied from Clarity UI)
        const deploymentPods = pods.filter(pod => {
          if (pod.namespace !== namespace) {
            return false
          }
          const podLabels = pathStr('metadata.labels', pod)
          return any(
            ([key, value]) => key === labelKey && value === labelValue,
            toPairs(podLabels))
        })
        return {
          ...item,
          labels: pathStr('metadata.labels', item),
          selectors,
          pods: deploymentPods.length,
          clusterId,
          clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
        }
      }),
    )(items)
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
      namespace: pathStr('metadata.namespace', item),
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
        pathStr('metadata.namespace', pod),
        pathStr('metadata.name', pod),
      )
      return {
        ...pod,
        dashboardUrl,
        namespace: pathStr('metadata.namespace', pod),
        labels: pathStr('metadata.labels', pod),
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
