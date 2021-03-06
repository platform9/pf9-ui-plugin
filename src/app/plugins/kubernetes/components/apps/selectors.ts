import { createSelector } from 'reselect'
import { map, mergeLeft, pipe, propEq } from 'ramda'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'
import { allKey } from 'app/constants'
import { filterIf } from 'utils/fp'

export const makeDeployedAppsSelector = (defaultParams = {}) => {
  return createSelector(
    [
      getDataSelector<DataKeys.DeployedApps>(DataKeys.DeployedApps, ['clusterId']),
      getDataSelector<DataKeys.Apps>(DataKeys.Apps),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (deployedApps, apps, params) => {
      const { clusterId, namespace, orderBy, orderDirection } = params
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
