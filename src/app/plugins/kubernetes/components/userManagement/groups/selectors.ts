import { createSelector } from 'reselect'
import { pipe, map, propEq, pathOr } from 'ramda'
import { emptyArr } from 'utils/fp'
import { dataStoreKey, cacheStoreKey } from 'core/caching/cacheReducers'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'

export const storageClassSelector = createSelector(
  [pathOr(emptyArr, [cacheStoreKey, dataStoreKey, DataKeys.StorageClasses]), clustersSelector],
  (rawStorageClasses, clusters) => {
    return map(
      (storageClass) => ({
        ...storageClass,
        id: pathStr('metadata.uid', storageClass),
        name: pathStr('metadata.name', storageClass),
        clusterName: pipe(find(propEq('uuid', storageClass.clusterId)), prop('name'))(clusters),
        type: pathStr('parameters.type', storageClass),
        created: pathStr('metadata.creationTimestamp', storageClass),
      }),
      rawStorageClasses,
    )
  },
)
