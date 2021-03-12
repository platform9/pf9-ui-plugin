import { createSelector } from 'reselect'
import { pathOr } from 'ramda'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { importedClustersSelector } from '../infrastructure/importedClusters/selectors'
import { findClusterName } from 'k8s/util/helpers'

export const namespacesSelector = createSelector(
  getDataSelector<DataKeys.Clusters>(DataKeys.Clusters),
  importedClustersSelector,
  getDataSelector<DataKeys.Namespaces>(DataKeys.Namespaces, ['clusterId']),
  (rawClusters, importedClusters, rawNamespaces) => {
    return rawNamespaces.map((ns) => ({
      ...ns,
      clusterName: findClusterName([...rawClusters, ...importedClusters], ns.clusterId),
      status: pathOr('N/A', ['status', 'phase'], ns),
    }))
  },
)
