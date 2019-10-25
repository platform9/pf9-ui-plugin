import jsYaml from 'js-yaml'
import createCRUDActions from 'core/helpers/createCRUDActions'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import { pluck, pipe, propEq, find, prop, pathEq, any, toPairs, head, flatten } from 'ramda'
import { mapAsync, pipeAsync, someAsync } from 'utils/async'
import { parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { pathJoin } from 'utils/misc'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'
import { pathStr, filterIf, pathStrOr, emptyObj, emptyArr } from 'utils/fp'

const { qbert } = ApiClient.getInstance()

const k8sDocUrl = 'namespaces/kube-system/services/https:kubernetes-dashboard:443/proxy/#'
export const podsCacheKey = 'pods'
export const deploymentsCacheKey = 'deployments'
export const kubeServicesCacheKey = 'kubeServices'

export const podActions = createCRUDActions(podsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterPods)).then(flatten)
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
    return pipeAsync(
      // Filter by namespace
      filterIf(namespace && namespace !== allKey, pathEq(['metadata', 'namespace'], namespace)),
      mapAsync(async pod => {
        const clusterId = prop('clusterId', pod)
        const dashboardUrl = pathJoin(await qbert.clusterBaseUrl(pod.clusterId),
          k8sDocUrl,
          'pod',
          pathStr('metadata.namespace', pod),
          pathStr('metadata.name', pod),
        )
        return {
          ...pod,
          dashboardUrl,
          namespace: pathStr('metadata.namespace', pod),
          labels: pathStr('metadata.labels', pod),
          clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
        }
      }),
    )(items)
  },
  uniqueIdentifier: 'metadata.uid',
  indexBy: 'clusterId',
})

export const deploymentActions = createCRUDActions(deploymentsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterDeployments)).then(flatten)
    }
    return qbert.getClusterDeployments(clusterId)
  },
  createFn: async ({ clusterId, namespace, yaml }) => {
    const body = jsYaml.safeLoad(yaml)
    // Also need to refresh the list of pods
    podActions.invalidateCache()
    return qbert.createDeployment(clusterId, namespace, body)
  },
  dataMapper: async (items, { clusterId, namespace }, loadFromContext) => {
    const [clusters, pods] = await Promise.all([
      loadFromContext(clustersCacheKey),
      loadFromContext(podsCacheKey, { clusterId, namespace }),
    ])
    return pipeAsync(
      // Filter by namespace
      filterIf(namespace && namespace !== allKey, pathEq(['metadata', 'namespace'], namespace)),
      mapAsync(async deployment => {
        const dashboardUrl = pathJoin(await qbert.clusterBaseUrl(deployment.clusterId),
          k8sDocUrl,
          'deployment',
          pathStr('metadata.namespace', deployment),
          pathStr('metadata.name', deployment),
        )
        const selectors = pathStrOr(emptyObj, 'spec.selector.matchLabels', deployment)
        const clusterId = prop('clusterId', deployment)
        const namespace = pathStr('metadata.namespace', deployment)
        const [labelKey, labelValue] = head(toPairs(selectors)) || emptyArr

        // Check if any pod label matches the first deployment match label key
        // Note: this logic should probably be revised (copied from Clarity UI)
        const deploymentPods = pods.filter(pod => {
          if (pod.namespace !== namespace || pod.clusterId !== clusterId) {
            return false
          }
          const podLabels = pathStr('metadata.labels', pod)
          return any(
            ([key, value]) => key === labelKey && value === labelValue,
            toPairs(podLabels))
        })
        return {
          ...deployment,
          dashboardUrl,
          id: pathStr('metadata.uid', deployment),
          name: pathStr('metadata.name', deployment),
          created: pathStr('metadata.creationTimestamp', deployment),
          labels: pathStr('metadata.labels', deployment),
          selectors,
          pods: deploymentPods.length,
          namespace,
          clusterName: pipe(find(propEq('uuid', deployment.clusterId)), prop('name'))(clusters),
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
      return someAsync(pluck('uuid', clusters).map(qbert.getClusterKubeServices)).then(flatten)
    }
    return qbert.getClusterKubeServices(clusterId)
  },
  createFn: async ({ clusterId, namespace, yaml }) => {
    const body = jsYaml.safeLoad(yaml)
    const created = await qbert.createService(clusterId, namespace, body)
    return {
      ...created,
      clusterId,
      name: pathStr('metadata.name', created),
      created: pathStr('metadata.creationTimestamp', created),
      id: pathStr('metadata.uid', created),
      namespace: pathStr('metadata.namespace', created),
    }
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId, namespace, name } = await currentItems.find(x => x.id === id)
    await qbert.deleteService(clusterId, namespace, name)
  },
  dataMapper: async (items, { clusterId, namespace }, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    return pipeAsync(
      // Filter by namespace
      filterIf(namespace && namespace !== allKey, pathEq(['metadata', 'namespace'], namespace)),
      mapAsync(async service => {
        const dashboardUrl = pathJoin(await qbert.clusterBaseUrl(service.clusterId),
          k8sDocUrl,
          'service',
          pathStr('metadata.namespace', service),
          pathStr('metadata.name', service),
        )
        const clusterId = prop('clusterId', service)
        const type = pathStr('spec.type', service)
        const externalName = pathStr('spec.externalName', service)
        const name = pathStr('metadata.name', service)
        const ports = pathStrOr(emptyArr, 'spec.ports', service)
        const loadBalancerEndpoints = pathStrOr(emptyArr, 'status.loadBalancer.ingress', service)
        const internalEndpoints = ports.map(port => [
          `${name}:${port.port} ${port.protocol}`,
          `${name}:${port.nodePort || 0} ${port.protocol}`,
        ]).flat()
        const externalEndpoints = [
          ...(externalName ? [externalName] : []),
          ...pluck('hostname', loadBalancerEndpoints),
          ...(type === 'NodePort' ? ['&lt;nodes&gt;'] : []),
        ]
        const clusterIp = pathStr('spec.clusterIP', service)
        const status = !clusterIp || (type === 'LoadBalancer' && !externalEndpoints.length)
          ? 'Pending'
          : 'OK'
        return {
          ...service,
          dashboardUrl,
          labels: pathStr('metadata.labels', service),
          selectors: pathStrOr(emptyObj, 'spec.selector', service),
          type,
          status,
          clusterIp,
          internalEndpoints,
          externalEndpoints,
          namespace: pathStr('metadata.namespace', service),
          clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
        }
      }),
    )(items)
  },
  service: 'qbert',
  entity: 'services',
  cacheKey: kubeServicesCacheKey,
  indexBy: 'clusterId',
})
