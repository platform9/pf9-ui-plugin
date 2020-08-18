import { createSelector } from 'reselect'
import { pathOr } from 'ramda'
import { IDataKeys } from 'k8s/datakeys.model'
import DataKeys from 'k8s/DataKeys'
import { INamespace } from './model'
import getDataSelector from 'core/utils/getDataSelector'

const findClusterName = (clusters, clusterId) => {
  const cluster = clusters.find((x) => x.uuid === clusterId)
  return (cluster && cluster.name) || ''
}

export const namespacesSelector = createSelector<
  IDataKeys,
  IDataKeys[DataKeys.Namespaces],
  IDataKeys[DataKeys.Clusters],
  INamespace[]
>(
  getDataSelector<DataKeys.Namespaces>(DataKeys.Namespaces, ['clusterId']),
  getDataSelector<DataKeys.Clusters>(DataKeys.Clusters),
  (rawNamespaces, rawClusters) => {
    return rawNamespaces.map((ns) => ({
      ...ns,
      clusterName: findClusterName(rawClusters, ns.clusterId),
      status: pathOr('N/A', ['status', 'phase'], ns),
    }))
  },
)
