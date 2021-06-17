import { createSelector } from 'reselect'
import { mergeLeft, pipe, propEq } from 'ramda'
import createSorter from 'core/helpers/createSorter'
import { allKey } from 'app/constants'
import { filterIf } from 'utils/fp'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { appsSelector } from '../selectors'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { importedClustersSelector } from 'k8s/components/infrastructure/importedClusters/selectors'
import { IDeployedAppsSelector } from '../models'

export const deployedAppsSelector = createSelector(
  [getDataSelector<DataKeys.DeployedApps>(DataKeys.DeployedApps, ['clusterId']), appsSelector],
  (rawDeployedApps, apps) => {
    return rawDeployedApps.map((deployedApp) => {
      const app = apps.find((app) => app.name === deployedApp.chart)
      return {
        ...deployedApp,
        repository: app?.repository,
        icon: app?.icon,
        home: app?.home,
      }
    })
  },
)

export const makeDeployedAppsSelector = (
  defaultParams = {
    orderBy: 'name',
    orderDirection: 'asc',
  },
) => {
  return createSelector(
    [
      deployedAppsSelector,
      clustersSelector,
      importedClustersSelector,
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (deployedApps, clusters, importedClusters, params) => {
      const { clusterId, namespace, orderBy, orderDirection } = params
      const allClusters = [...clusters, ...importedClusters]
      if (!clusterId || !allClusters.find(propEq('uuid', clusterId))) {
        // If no cluster if found, this item is invalid because the cluster has been deleted
        return []
      }
      return pipe<
        IDeployedAppsSelector[],
        IDeployedAppsSelector[],
        IDeployedAppsSelector[],
        IDeployedAppsSelector[]
      >(
        filterIf(clusterId && clusterId !== allKey, propEq('clusterId', clusterId)),
        filterIf(namespace && namespace !== allKey, propEq('namespace', namespace)),
        createSorter({ orderBy, orderDirection }),
      )(deployedApps)
    },
  )
}
