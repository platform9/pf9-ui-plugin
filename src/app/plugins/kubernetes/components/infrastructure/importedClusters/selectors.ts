import createSorter from 'core/helpers/createSorter'
import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'
import { mergeLeft, pipe } from 'ramda'
import { createSelector } from 'reselect'

export const importedClustersSelector = createSelector(
  [getDataSelector<DataKeys.ImportedClusters>(DataKeys.ImportedClusters)],
  (importedClusters) => {
    return importedClusters.map((cluster) => {
      return {
        ...cluster,
        name: cluster.spec?.displayName,
        cloudProviderId: cluster.spec?.cloudProviderID,
        external: cluster.metadata?.labels?.external,
        status: cluster.status?.phase,
        region: cluster.metadata?.labels?.region,
        kubeVersion: cluster.spec?.kubeVersion,
        creationTimestamp: cluster.metadata?.creationTimestamp,
        containerCidr: cluster.spec?.eks?.network?.containerCidr,
        servicesCidr: cluster.spec?.eks?.network?.servicesCidr,
        nodeGroups: cluster.spec?.eks?.nodegroups,
      }
    })
  },
)

export const makeImportedClustersSelector = (
  defaultParams = {
    orderBy: 'creationTimestamp',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [importedClustersSelector, (_, params) => mergeLeft(params, defaultParams)],
    (alertRules, params) => {
      const { orderBy, orderDirection } = params
      return pipe(createSorter({ orderBy, orderDirection }))(alertRules)
    },
  )
}
