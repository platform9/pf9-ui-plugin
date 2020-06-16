import { createSelector } from 'reselect'
import { pathOr } from 'ramda'
import { emptyArr } from 'utils/fp'
import { cacheStoreKey, dataStoreKey } from 'core/caching/cacheReducers'
import { namespacesCacheKey } from 'k8s/components/namespaces/actions'
import { clustersCacheKey } from 'k8s/components/infrastructure/common/actions'

const findClusterName = (clusters, clusterId) => {
  const cluster = clusters.find((x) => x.uuid === clusterId)
  return (cluster && cluster.name) || ''
}

export const namespacesSelector = createSelector(
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, namespacesCacheKey]),
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, clustersCacheKey]),
  (rawNamespaces, rawClusters) => {
    return rawNamespaces.map((ns) => ({
      ...ns,
      clusterName: findClusterName(rawClusters, ns.clusterId),
      status: pathOr('N/A', ['status', 'phase'], ns),
    }))
  }

)
