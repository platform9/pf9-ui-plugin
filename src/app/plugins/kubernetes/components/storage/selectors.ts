import { createSelector } from 'reselect'
import { find, map, pipe, prop, propEq } from 'ramda'
import { pathStr } from 'utils/fp'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'

export const storageClassSelector = createSelector(
  [getDataSelector<DataKeys.StorageClasses>(DataKeys.StorageClasses), clustersSelector],
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
