import { createSelector } from 'reselect'
import { map, mergeLeft, pipe, propEq } from 'ramda'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'
import { allKey } from 'app/constants'
import { filterIf } from 'utils/fp'
import { clustersSelector } from '../infrastructure/clusters/selectors'
import { importedClustersSelector } from '../infrastructure/importedClusters/selectors'

export const makeDeployedAppsSelector = (
  defaultParams = { orderBy: 'name', orderDirection: 'asc' },
) => {
  return createSelector(
    [
      getDataSelector<DataKeys.DeployedApps>(DataKeys.DeployedApps, ['clusterId']),
      getDataSelector<DataKeys.Apps>(DataKeys.Apps),
      clustersSelector,
      importedClustersSelector,
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (deployedApps, apps, clusters, importedClusters, params) => {
      const { clusterId, namespace, orderBy, orderDirection } = params
      const allClusters = [...clusters, ...importedClusters]
      if (!clusterId || !allClusters.find(propEq('uuid', clusterId))) {
        // If no cluster if found, this item is invalid because the cluster has been deleted
        return []
      }
      return pipe<any, any, any, any, any>(
        filterIf(clusterId && clusterId !== allKey, propEq('clusterId', clusterId)),
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        map((deployedApp: any) => {
          const app = apps.find((app) => app.name === deployedApp.chart)
          return {
            ...deployedApp,
            repository: app?.repository,
            icon: app?.icon,
            home: app?.home,
          }
        }),
        createSorter({ orderBy, orderDirection }),
      )(deployedApps)
    },
  )
}
