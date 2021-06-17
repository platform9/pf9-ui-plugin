import { createSelector } from 'reselect'
import { pathOr, propEq, isNil, complement } from 'ramda'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { importedClustersSelector } from '../infrastructure/importedClusters/selectors'

export const namespacesSelector = createSelector(
  getDataSelector<DataKeys.Clusters>(DataKeys.Clusters),
  importedClustersSelector,
  getDataSelector<DataKeys.Namespaces>(DataKeys.Namespaces, ['clusterId']),
  (rawClusters, importedClusters, rawNamespaces) => {
    return rawNamespaces
      .map((ns) => {
        const cluster = [...rawClusters, ...importedClusters].find(propEq('uuid', ns.clusterId))
        if (!cluster) {
          // If no cluster if found, this item is invalid because the parent cluster has been deleted
          return null
        }
        return {
          ...ns,
          clusterName: cluster.name,
          status: pathOr('N/A', ['status', 'phase'], ns),
        }
      })
      .filter(complement(isNil))
  },
)
