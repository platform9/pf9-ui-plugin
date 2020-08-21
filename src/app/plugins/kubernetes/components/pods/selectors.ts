import { createSelector } from 'reselect'
import { any, find, head, map, mergeLeft, pathEq, pipe, pluck, prop, propEq, toPairs } from 'ramda'
import { emptyArr, emptyObj, filterIf, pipeWhenTruthy } from 'utils/fp'
import { allKey } from 'app/constants'
import { pathJoin } from 'utils/misc'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { combinedHostsSelector } from '../infrastructure/common/selectors'
import createSorter from 'core/helpers/createSorter'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { IClusterSelector } from '../infrastructure/clusters/model'
import { IPodSelector, IServicesSelector, ICombinedNodesSelector } from './model'
import { IDataKeys, GlobalState } from 'k8s/datakeys.model'
import { FluffySelector, MatchLabelsClass, Node } from 'api-client/qbert.model'
import { ICombinedHost } from '../infrastructure/common/model'
import { IFace } from 'api-client/keystone.model'

const k8sDocUrl = 'namespaces/kube-system/qbertservices/https:kubernetes-dashboard:443/proxy/#'

export const nodesSelector = createSelector<
  GlobalState,
  Node[],
  ICombinedHost[],
  Array<IFace & { name: string }>,
  ICombinedNodesSelector[]
>(
  [
    getDataSelector<DataKeys.Nodes>(DataKeys.Nodes),
    combinedHostsSelector,
    getDataSelector<DataKeys.ServiceCatalog>(DataKeys.ServiceCatalog),
  ],
  (rawNodes, combinedHosts, rawServiceCatalog) => {
    const combinedHostsObj = combinedHosts.reduce((accum, host) => {
      const id = host?.resmgr?.id || host?.qbert?.uuid || null
      accum[id] = host
      return accum
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    }, {} as { [key: string]: ICombinedHost })

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
          pod?.metadata?.namespace, // pathStr('metadata.namespace', pod),
          pod?.metadata?.name, // pathStr('metadata.name', pod),
        )
        return {
          ...pod,
          dashboardUrl,
          id: pod?.metadata?.uid, // pathStr('metadata.uid', pod),
          name: pod?.metadata?.name, // pathStr('metadata.name', pod),
          namespace: pod?.metadata?.namespace, // pathStr('metadata.namespace', pod),
          labels: pod?.metadata?.labels, // pathStr('metadata.labels', pod),
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
        rawDeployment?.metadata.namespace,
        rawDeployment?.metadata.name,
      )
      const selectors = rawDeployment?.spec?.selector?.matchLabels || (emptyObj as MatchLabelsClass)
      const namespace = rawDeployment?.metadata?.namespace
      const [labelKey, labelValue] = head(toPairs(selectors)) || emptyArr

      // Check if any pod label matches the first deployment match label key
      // Note: this logic should probably be revised (copied from Clarity UI)
      const deploymentPods = pods.filter((pod) => {
        if (pod.namespace !== namespace || pod.clusterId !== clusterId) {
          return false
        }
        const podLabels = pod?.metadata?.labels // pathStr('metadata.labels', pod)
        return any(([key, value]) => key === labelKey && value === labelValue, toPairs(podLabels))
      })
      return {
        ...rawDeployment,
        dashboardUrl,
        id: rawDeployment?.metadata?.uid,
        name: rawDeployment?.metadata?.name,
        created: rawDeployment?.metadata?.creationTimestamp,
        labels: rawDeployment?.metadata?.labels,
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
        const clusterIp = service?.spec?.clusterIP
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
