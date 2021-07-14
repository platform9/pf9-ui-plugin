import { createSelector } from 'reselect'
import {
  any,
  head,
  map,
  mergeLeft,
  pathEq,
  pathOr,
  pipe,
  pluck,
  propEq,
  toPairs as ToPairs,
  filter,
  isNil,
  complement,
  assocPath,
} from 'ramda'
import { emptyArr, emptyObj, filterIf, arrayIfEmpty } from 'utils/fp'
import { allKey } from 'app/constants'
import { pathJoin } from 'utils/misc'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { IDeploymentSelector, IPodSelector, IServicesSelector } from './model'
import { IDataKeys } from 'k8s/datakeys.model'
import { FluffySelector, MatchLabelsClass } from 'api-client/qbert.model'
import {
  getK8sDashboardLinkFromVersion,
  getScopedClusterProxyEndpoint,
} from '../infrastructure/clusters/helpers'
import { clientStoreKey } from 'core/client/clientReducers'
import { importedClustersSelector } from '../infrastructure/importedClusters/selectors'

const toPairs: any = ToPairs

export const podsSelector = createSelector(
  [
    getDataSelector<DataKeys.Pods>(DataKeys.Pods, ['clusterId']),
    clustersSelector,
    importedClustersSelector,
    (state) => pathOr('', [clientStoreKey, 'endpoints', 'qbert'])(state),
  ],
  (rawPods, clusters, importedClusters, qbertEndpoint) => {
    // associate nodes with the combinedHost entry
    return pipe<IDataKeys[DataKeys.Pods], IPodSelector[], IPodSelector[], IPodSelector[]>(
      // Filter by namespace
      map((pod) => {
        const { clusterId } = pod
        const allClusters = [...clusters, ...importedClusters]
        const cluster = allClusters.find(propEq('uuid', clusterId))
        if (!cluster) {
          // If no cluster if found, this item is invalid because the parent cluster has been deleted
          return null
        }
        const name = pod?.metadata?.name // pathStr('metadata.name', pod),
        const namespace = pod?.metadata?.namespace // pathStr('metadata.namespace', pod),
        const k8sDashboardUrl = getK8sDashboardLinkFromVersion(
          cluster?.version,
          qbertEndpoint,
          cluster,
        )
        const dashboardUrl = `${k8sDashboardUrl}#/pod/${namespace}/${name}?namespace=${namespace}`
        const containers = pod?.spec?.containers
        const logUrls = containers.map((container) => {
          const logsEndpoint = pathJoin(
            getScopedClusterProxyEndpoint(qbertEndpoint, cluster),
            '/namespaces/', // qbert v3 link fails authorization so we have to use v1 link for logs
            namespace,
            'pods',
            name,
            'log',
          )
          return {
            containerName: container.name,
            url: `${logsEndpoint}?container=${container.name}`,
          }
        })

        return {
          ...pod,
          dashboardUrl,
          id: pod?.metadata?.uid, // pathStr('metadata.uid', pod),
          name,
          namespace,
          labels: pod?.metadata?.labels, // pathStr('metadata.labels', pod),
          clusterName: cluster?.name,
          logs: logUrls,
        }
      }),
      filter(complement(isNil)),
      arrayIfEmpty,
    )(rawPods)
  },
)

export const makePodsSelector = (defaultParams = emptyObj) => {
  return createSelector(
    [podsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (pods, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe<IPodSelector[], IPodSelector[], IPodSelector[], IPodSelector[]>(
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        createSorter({ orderBy, orderDirection }),
        arrayIfEmpty,
      )(pods)
    },
  )
}
/* 
  {
    clusterId: {
      namespace: []
    }
  }
*/
const podsByClusterIdAndNamespaceSelector = createSelector([podsSelector], (rawPods) => {
  rawPods.reduce((accum, pod) => {
    const { clusterId } = pod
    const namespace = pod?.metadata?.namespace
    return assocPath([clusterId, namespace], pod, accum)
  }, emptyObj)
})

export const deploymentsSelector = createSelector(
  [
    getDataSelector<DataKeys.Deployments>(DataKeys.Deployments, ['clusterId']),
    podsByClusterIdAndNamespaceSelector,
    clustersSelector,
    importedClustersSelector,
    (state) => pathOr('', [clientStoreKey, 'endpoints', 'qbert'])(state),
  ],
  (rawDeployments, podsByClusterIdAndNamespace, clusters, importedClusters, qbertEndpoint) => {
    return arrayIfEmpty(
      rawDeployments
        .map((rawDeployment) => {
          const { clusterId } = rawDeployment
          const allClusters = [...clusters, ...importedClusters]
          const cluster = allClusters.find(propEq('uuid', clusterId))
          if (!cluster) {
            // If no cluster if found, this item is invalid because the parent cluster has been deleted
            return null
          }
          const selectors =
            rawDeployment?.spec?.selector?.matchLabels || (emptyObj as MatchLabelsClass)
          const name = rawDeployment?.metadata?.name
          const namespace = rawDeployment?.metadata?.namespace
          const [labelKey, labelValue] = head(toPairs(selectors)) || emptyArr

          const k8sDashboardUrl = getK8sDashboardLinkFromVersion(
            cluster?.version,
            qbertEndpoint,
            cluster,
          )
          const dashboardUrl = `${k8sDashboardUrl}#/deployment/${namespace}/${name}?namespace=${namespace}`

          // Check if any pod label matches the first deployment match label key
          // Note: this logic should probably be revised (copied from Clarity UI)
          const associatedPods = podsByClusterIdAndNamespace?.[clusterId]?.[namespace] || emptyArr
          const deploymentPods = getDeploymentPods(associatedPods, labelKey, labelValue)
          return {
            ...rawDeployment,
            dashboardUrl,
            id: rawDeployment?.metadata?.uid,
            name,
            created: rawDeployment?.metadata?.creationTimestamp,
            labels: rawDeployment?.metadata?.labels,
            selectors,
            pods: deploymentPods.length,
            namespace,
            clusterName: cluster?.name,
          }
        })
        .filter(complement(isNil)),
    )
  },
)

const getDeploymentPods = (pods, labelKey, labelValue) => {
  return pods.filter((pod) => {
    const podLabels = pod?.metadata?.labels // pathStr('metadata.labels', pod)
    return any(([key, value]) => key === labelKey && value === labelValue, toPairs(podLabels))
  })
}

export const makeDeploymentsSelector = (defaultParams = {}) => {
  return createSelector(
    [deploymentsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (deployments, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe<
        IDeploymentSelector[],
        IDeploymentSelector[],
        IDeploymentSelector[],
        IDeploymentSelector[]
      >(
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        createSorter({ orderBy, orderDirection }),
        arrayIfEmpty,
      )(deployments)
    },
  )
}

export const serviceSelectors = createSelector(
  [
    getDataSelector<DataKeys.KubeServices>(DataKeys.KubeServices, 'clusterId'),
    clustersSelector,
    importedClustersSelector,
    (state) => pathOr('', [clientStoreKey, 'endpoints', 'qbert'])(state),
  ],
  (rawServices, clusters, importedClusters, qbertEndpoint) => {
    return arrayIfEmpty(
      rawServices
        .map((service) => {
          const { clusterId } = service
          const allClusters = [...clusters, ...importedClusters]
          const cluster = allClusters.find(propEq('uuid', clusterId))
          if (!cluster) {
            // If no cluster if found, this item is invalid because the parent cluster has been deleted
            return null
          }
          const type = service?.spec?.type // = pathStr('spec.type', service)
          const externalName = service?.spec?.externalName // pathStr('spec.externalName', service)
          const name = service?.metadata?.name // pathStr('metadata.name', service)
          const namespace = service?.metadata?.namespace // pathStr('metadata.namespace', service)
          const ports = service?.spec?.ports || [] // pathStrOr(emptyArr, 'spec.ports', service)
          const loadBalancerEndpoints = service?.status?.loadBalancer?.ingress || emptyArr
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
            clusterIp && (type !== 'LoadBalancer' || externalEndpoints.length > 0)
              ? 'OK'
              : 'Pending'

          const k8sDashboardUrl = getK8sDashboardLinkFromVersion(
            cluster?.version,
            qbertEndpoint,
            cluster,
          )
          const dashboardUrl = `${k8sDashboardUrl}#/service/${namespace}/${name}?namespace=${namespace}`
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
            namespace,
            clusterName: cluster?.name,
          }
        })
        .filter(complement(isNil)),
    )
  },
)

export const makeServiceSelector = (defaultParams = {}) => {
  return createSelector(
    [serviceSelectors, (_, params) => mergeLeft(params, defaultParams)],
    (services, params) => {
      const { namespace, orderBy, orderDirection } = params
      return pipe<
        IServicesSelector[],
        IServicesSelector[],
        IServicesSelector[],
        IServicesSelector[]
      >(
        filterIf(namespace && namespace !== allKey, pathEq(['metadata', 'namespace'], namespace)),
        createSorter({ orderBy, orderDirection }),
        arrayIfEmpty,
      )(services)
    },
  )
}
