import { createSelector } from 'reselect'
import { find, propEq, prop, pipe, pathEq, map, mergeLeft, any } from 'ramda'
import { emptyArr, pathStrOrNull, pipeWhenTruthy, filterIf, pathStr, pathStrOr } from 'utils/fp'
import { allKey } from 'app/constants'
import { pathJoin } from 'utils/misc'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { combinedHostsSelector } from '../infrastructure/common/selectors'
import { GetClusterPodsItem, IGenericResource } from 'api-client/qbert.model'
import ApiClient from 'api-client/'
import createSorter from 'core/helpers/createSorter'

const k8sDocUrl = 'namespaces/kube-system/qbertservices/https:kubernetes-dashboard:443/proxy/#'

export const nodesSelector = createSelector(
  [
    getDataSelector<DataKeys.Nodes>(DataKeys.Nodes),
    combinedHostsSelector,
    getDataSelector<DataKeys.ServiceCatalog>(DataKeys.ServiceCatalog),
  ],
  (rawNodes, combinedHosts, rawServiceCatalog) => {
    const combinedHostsObj = combinedHosts.reduce((accum, host) => {
      const id = pathStrOrNull('resmgr.id')(host) || pathStrOrNull('qbert.uuid')(host)
      accum[id] = host
      return accum
    }, {})

    const qbertUrl =
      pipeWhenTruthy(find(propEq('name', 'qbert')), prop('url'))(rawServiceCatalog) || ''

    // associate nodes with the combinedHost entry
    return rawNodes.map((node) => ({
      ...node,
      combined: combinedHostsObj[node.uuid],
      // qbert v3 link fails authorization so we have to use v1 link for logs
      logs: `${qbertUrl}/logs/${node.uuid}`.replace(/v3/, 'v1'),
    }))
  },
)

export const podsSelector = createSelector([
    getDataSelector<DataKeys.Pods>(DataKeys.Pods),
    getDataSelector<DataKeys.Clusters>(DataKeys.Clusters),
], (rawPods, clusters) => {
    // associate nodes with the combinedHost entry
    return pipe(
      // Filter by namespace
      map(async (pod: IGenericResource<GetClusterPodsItem>) => {
        const { clusterId } = pod
        const cluster = find(propEq('uuid', clusterId), clusters)
        const dashboardUrl = pathJoin(
          cluster.baseUrl,
          k8sDocUrl,
          'pod',
          pathStr('metadata.namespace', pod),
          pathStr('metadata.name', pod),
        )
        return {
          ...pod,
          dashboardUrl,
          id: pathStr('metadata.uid', pod),
          name: pathStr('metadata.name', pod),
          namespace: pathStr('metadata.namespace', pod),
          labels: pathStr('metadata.labels', pod),
          clusterName: cluster.name,
        }
      }),
    )(rawPods)
  },
)

export const makeParamsPodsSelector = (defaultParams = {}) => {
  return createSelector(
    [podsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (pods, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe(
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        createSorter({ orderBy, orderDirection }),
      )(pods)
    },
  )
}

export const deploymentsSelector = createSelector(
  [
    getDataSelector<DataKeys.Deployments>(DataKeys.Deployments),
    getDataSelector<DataKeys.Pods>(DataKeys.Pods),
    getDataSelector<DataKeys.Clusters>(DataKeys.Clusters),
  ],
  (rawDeployments, rawPods, clusters) => {
    return rawDeployments.map((deployment) => {
      const { clusterId } = deployment
      const cluster = find(propEq('uuid', clusterId), clusters)
      const dashboardUrl = pathJoin(
        cluster.baseUrl,
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
      const deploymentPods = pods.filter((pod) => {
        if (pod.namespace !== namespace || pod.clusterId !== clusterId) {
          return false
        }
        const podLabels = pathStr('metadata.labels', pod)
        return any(([key, value]) => key === labelKey && value === labelValue, toPairs(podLabels))
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
        clusterName: cluster.name,
      }
    })
  },
)

export const makeParamsDeploymentsSelector = (defaultParams = {}) => {
  return createSelector(
    [podsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (pods, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe(
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        createSorter({ orderBy, orderDirection }),
      )(pods)
    },
  )
}

export const serviceSelectors = createSelector(
  [getDataSelector<DataKeys.Services>(DataKeys.Services, 'clusterId'), clustersSelector],
  (rawDeployments, clusters) => {
    return map((service) => {
      const { clusterId } = service
      const cluster = find(propEq('uuid', clusterId), clusters)
      const dashboardUrl = pathJoin(
        cluster.baseUrl,
        k8sDocUrl,
        'service',
        pathStr('metadata.namespace', service),
        pathStr('metadata.name', service),
      )
      const type = pathStr('spec.type', service)
      const externalName = pathStr('spec.externalName', service)
      const name = pathStr('metadata.name', service)
      const ports = pathStrOr(emptyArr, 'spec.ports', service)
      const loadBalancerEndpoints = pathStrOr(emptyArr, 'status.loadBalancer.ingress', service)
      const internalEndpoints = ports
        .map((port) => [
          `${name}:${port.port} ${port.protocol}`,
          `${name}:${port.nodePort || 0} ${port.protocol}`,
        ])
        .flat()
      const externalEndpoints = [
        ...(externalName ? [externalName] : []),
        ...pluck('hostname', loadBalancerEndpoints),
        ...(type === 'NodePort' ? ['&lt;nodes&gt;'] : []),
      ]
      const clusterIp = pathStr('spec.clusterIP', service)
      const status =
        clusterIp && (type !== 'LoadBalancer' || externalEndpoints.length > 0) ? 'OK' : 'Pending'
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
        clusterName: cluster.name,
      }
    })(rawDeployments)
  },
)

export const makeServiceSelector = (defaultParams = {}) => {
  return createSelector(
    [serviceSelectors, (_, params) => mergeLeft(params, defaultParams)],
    (services, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe(
        filterIf(namespace && namespace !== allKey, pathEq(['metadata', 'namespace'], namespace)),
        createSorter({ orderBy, orderDirection }),
      )(services)
    },
  )
}
