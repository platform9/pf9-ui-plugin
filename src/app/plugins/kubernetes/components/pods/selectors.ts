import { createSelector } from 'reselect'
import { any, find, head, map, mergeLeft, pathEq, pipe, pluck, prop, propEq, toPairs } from 'ramda'
import {
  emptyArr,
  emptyObj,
  filterIf,
  pathStr,
  pathStrOr,
  pathStrOrNull,
  pipeWhenTruthy,
} from 'utils/fp'
import { allKey } from 'app/constants'
import { pathJoin } from 'utils/misc'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { combinedHostsSelector } from '../infrastructure/common/selectors'
import createSorter from 'core/helpers/createSorter'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { IClusterSelector } from '../infrastructure/clusters/model'
import { IPodSelector, IServicesSelector } from './model'
import { IDataKeys, GlobalState } from 'k8s/datakeys.model'
import { FluffySelector } from 'api-client/qbert.model'

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

export const podsSelector = createSelector(
  [getDataSelector<DataKeys.Pods>(DataKeys.Pods), clustersSelector],
  (rawPods, clusters) => {
    // associate nodes with the combinedHost entry
    return pipe<IDataKeys[DataKeys.Pods], IPodSelector[]>(
      // Filter by namespace
      map((pod) => {
        const { clusterId } = pod
        const cluster = find<IClusterSelector>(propEq('uuid', clusterId), clusters)
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
      return pipe<IPodSelector[], IPodSelector[], IPodSelector[]>(
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        createSorter({ orderBy, orderDirection }),
      )(pods)
    },
  )
}

export const deploymentsSelector = createSelector(
  [getDataSelector<DataKeys.Deployments>(DataKeys.Deployments), podsSelector, clustersSelector],
  (rawDeployments, pods, clusters) => {
    return rawDeployments.map((rawDeployment) => {
      const { clusterId } = rawDeployment
      const cluster = find<IClusterSelector>(propEq('uuid', clusterId), clusters)
      const dashboardUrl = pathJoin(
        cluster.baseUrl,
        k8sDocUrl,
        'deployment',
        pathStr('metadata.namespace', rawDeployment),
        pathStr('metadata.name', rawDeployment),
      )
      const selectors = pathStrOr(emptyObj, 'spec.selector.matchLabels', rawDeployment)
      const namespace = pathStr('metadata.namespace', rawDeployment)
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
        ...rawDeployment,
        dashboardUrl,
        id: pathStr('metadata.uid', rawDeployment),
        name: pathStr('metadata.name', rawDeployment),
        created: pathStr('metadata.creationTimestamp', rawDeployment),
        labels: pathStr('metadata.labels', rawDeployment),
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
      return pipe<IPodSelector[], IPodSelector[], IPodSelector[]>(
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        createSorter({ orderBy, orderDirection }),
      )(pods)
    },
  )
}

export const serviceSelectors = createSelector<
  GlobalState,
  IDataKeys[DataKeys.KubeServices],
  IClusterSelector[],
  IServicesSelector[]
>(
  [getDataSelector<DataKeys.KubeServices>(DataKeys.KubeServices, 'clusterId'), clustersSelector],
  (rawServices, clusters) => {
    return pipe<IDataKeys[DataKeys.KubeServices], any>(
      map((service) => {
        const { clusterId } = service
        const cluster = find<IClusterSelector>(propEq('uuid', clusterId), clusters)
        const dashboardUrl = pathJoin(
          cluster.baseUrl,
          k8sDocUrl,
          'service',
          service?.metadata?.namespace || '',
          service?.metadata?.name || '',
        )
        const type = service?.spec?.type // = pathStr('spec.type', service)
        const externalName = service?.spec?.externalName // pathStr('spec.externalName', service)
        const name = service?.metadata?.name // pathStr('metadata.name', service)
        const ports = service?.spec?.ports || [] // pathStrOr(emptyArr, 'spec.ports', service)
        const loadBalancerEndpoints = service?.status?.loadBalancer?.ingress
        const internalEndpoints = ports
          .map((port) => [
            `${name}:${port.port} ${port.protocol}`,
            `${name}:${port.nodePort || 0} ${port.protocol}`,
          ])
          .flat()
        const externalEndpoints = [
          ...(externalName ? [externalName] : []),
          ...pluck<any, string>('hostname', loadBalancerEndpoints),
          ...(type === 'NodePort' ? ['&lt;nodes&gt;'] : []),
        ]
        const clusterIp = pathStr('spec.clusterIP', service)
        const status =
          clusterIp && (type !== 'LoadBalancer' || externalEndpoints.length > 0) ? 'OK' : 'Pending'
        return {
          ...service,
          dashboardUrl,
          labels: service?.metadata?.labels, // pathStr('metadata.labels', service)
          // selectors: pathStrOr(emptyObj, 'spec.selector', service),
          selectors: service?.spec?.selector || (emptyObj as FluffySelector),
          type,
          status,
          clusterIp,
          internalEndpoints,
          externalEndpoints,
          namespace: service?.metadata?.namespace, // pathStr('metadata.namespace', service)
          clusterName: cluster.name,
        }
      }),
    )(rawServices)
  },
)

export const makeServiceSelector = (defaultParams = {}) => {
  return createSelector(
    [serviceSelectors, (_, params) => mergeLeft(params, defaultParams)],
    (services, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe<IServicesSelector[], IServicesSelector[], IServicesSelector[]>(
        filterIf(namespace && namespace !== allKey, pathEq(['metadata', 'namespace'], namespace)),
        createSorter({ orderBy, orderDirection }),
      )(services)
    },
  )
}
