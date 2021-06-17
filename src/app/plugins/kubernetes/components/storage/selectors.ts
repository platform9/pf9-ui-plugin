import { createSelector } from 'reselect'
import { propSatisfies, complement, isNil } from 'ramda'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { importedClustersSelector } from '../infrastructure/importedClusters/selectors'
import { findClusterName } from 'k8s/util/helpers'

export const storageClassSelector = createSelector(
  [
    getDataSelector<DataKeys.StorageClasses>(DataKeys.StorageClasses, ['clusterId']),
    clustersSelector,
    importedClustersSelector,
  ],
  (rawStorageClasses, clusters, importedClusters) => {
    return rawStorageClasses
      .map((storageClass) => ({
        id: storageClass?.metadata?.uid,
        name: storageClass?.metadata?.name,
        clusterName: findClusterName([...clusters, ...importedClusters], storageClass.clusterId),
        type: storageClass?.parameters?.type,
        created: storageClass?.metadata?.creationTimestamp,
      }))
      .filter(propSatisfies(complement(isNil), 'clusterName'))
  },
)
