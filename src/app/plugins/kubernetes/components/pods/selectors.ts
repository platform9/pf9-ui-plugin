import { createSelector } from 'reselect'
import { pathOr, find, propEq, prop, pipe, pathEq, map } from 'ramda'
import { emptyArr, pathStrOrNull, pipeWhenTruthy, filterIf, pathStr } from 'utils/fp'
import { cacheStoreKey, dataStoreKey } from 'core/caching/cacheReducers'
import { nodesCacheKey } from 'k8s/components/infrastructure/nodes/actions'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import { serviceCatalogContextKey } from 'openstack/components/api-access/actions'
import { podsCacheKey } from 'k8s/components/pods/actions'
import { allKey } from 'app/constants'
import { pathJoin } from 'utils/misc'

export const nodesSelector = createSelector(
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, nodesCacheKey]),
  combinedHostsSelector,
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, serviceCatalogContextKey]),
  (rawNodes, combinedHosts, serviceCatalog) => {
    const combinedHostsObj = combinedHosts.reduce((accum, host) => {
      const id = pathStrOrNull('resmgr.id')(host) || pathStrOrNull('qbert.uuid')(host)
      accum[id] = host
      return accum
    }, {})

    const qbertUrl =
      pipeWhenTruthy(find(propEq('name', 'qbert')), prop('url'))(serviceCatalog) || ''

    // associate nodes with the combinedHost entry
    return rawNodes.map((node) => ({
      ...node,
      combined: combinedHostsObj[node.uuid],
      // qbert v3 link fails authorization so we have to use v1 link for logs
      logs: `${qbertUrl}/logs/${node.uuid}`.replace(/v3/, 'v1'),
    }))
  }
)

export const podsSelector = createSelector(
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, podsCacheKey]),
  (pods, clusters, clusterUrls) => {

    // associate nodes with the combinedHost entry
    return pipe(
      // Filter by namespace
      filterIf(namespace && namespace !== allKey, pathEq(['metadata', 'namespace'], namespace)),
      map(async (pod) => {
        const clusterId = prop('clusterId', pod)
        const dashboardUrl = pathJoin(
          await qbert.clusterBaseUrl(pod.clusterId),
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
          clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
        }
      }),
    )(pods)
  }
)
