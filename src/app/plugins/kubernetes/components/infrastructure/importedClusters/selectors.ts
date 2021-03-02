import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'
import { createSelector } from 'reselect'

export const importedClustersSelector = createSelector(
  [getDataSelector<DataKeys.ImportedClusters>(DataKeys.ImportedClusters)],
  (importedClusters) => {
    return importedClusters.map((cluster) => {
      console.log(cluster)
      return {
        ...cluster,
        name: cluster.spec?.displayName,
        external: cluster.metadata?.labels?.external,
        status: cluster.status?.phase,
        region: cluster.metadata?.labels?.region,
        kubeVersion: cluster.spec?.kubeVersion,
        creationTimestamp: cluster.metadata?.creationTimestamp,
        containerCidr: cluster.spec?.eks?.network?.containerCidr,
        servicesCidr: cluster.spec?.eks?.network?.servicesCidr,
        nodeGroups: cluster.spec?.eks?.network?.nodeGroups,
      }
    })
  },
)
