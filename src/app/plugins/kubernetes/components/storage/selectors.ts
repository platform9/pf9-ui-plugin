import { createSelector } from 'reselect'
import { find, map, pipe, prop, propEq } from 'ramda'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { IClusterSelector } from '../infrastructure/clusters/model'

export const storageClassSelector = createSelector(
  [getDataSelector<DataKeys.StorageClasses>(DataKeys.StorageClasses), clustersSelector],
  (rawStorageClasses, clusters) => {
    return map(
      (storageClass) => ({
        // ...storageClass,
        id: storageClass?.metadata.uid,
        name: storageClass?.metadata.name,
        clusterName: pipe<IClusterSelector[], IClusterSelector, string>(
          find<IClusterSelector>(propEq('uuid', storageClass.clusterId)),
          prop('name'),
        )(clusters),
        type: storageClass?.parameters.type,
        created: storageClass?.metadata.creationTimestamp,
      }),
      rawStorageClasses,
    )
  },
)
