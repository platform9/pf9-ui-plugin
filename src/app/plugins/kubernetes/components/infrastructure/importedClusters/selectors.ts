import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'
import { createSelector } from 'reselect'

export const importedClustersSelector = createSelector(
  [getDataSelector<DataKeys.ImportedClusters>(DataKeys.ImportedClusters)],
  (importedClusters) => {
    return importedClusters.map((cluster) => {
      return cluster
    })
  },
)
