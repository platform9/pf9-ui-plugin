import { createSelector } from 'reselect'
import { pathOr } from 'ramda'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'

const findClusterName = (clusters, clusterId) => {
  const cluster = clusters.find((x) => x.uuid === clusterId)
  return (cluster && cluster.name) || ''
}

export const namespacesSelector = createSelector(
  getDataSelector<DataKeys.Clusters>(DataKeys.Clusters),
  getDataSelector<DataKeys.Namespaces>(DataKeys.Namespaces, ['clusterId']),
  (rawClusters, rawNamespaces) => {
    return rawNamespaces.map((ns) => ({
      ...ns,
      clusterName: findClusterName(rawClusters, ns.clusterId),
      status: pathOr('N/A', ['status', 'phase'], ns),
    }))
  },
)
