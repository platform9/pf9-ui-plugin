import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import createContextLoader from 'core/helpers/createContextLoader'
import { ActionDataKeys } from 'k8s/DataKeys'
import { makeAppsSelector } from './selectors'
import Bugsnag from '@bugsnag/js'

const { helm } = ApiClient.getInstance()

export const appDetailsLoader = createContextLoader(
  ActionDataKeys.AppDetails,
  async ({ repository, name, infoType = 'all', versions = true }) => {
    Bugsnag.leaveBreadcrumb('Attempting to load app details', { name, repository })
    const chart = await helm.getChartInfo(repository, name, {
      info_type: infoType,
      versions,
    })
    return {
      ...chart,
      name,
      repository,
    }
  },
  {
    entityName: 'App Detail',
    uniqueIdentifier: ['name', 'repository'],
    indexBy: ['repository', 'name'],
  },
)

const parseRepoName = (name) => name.match(/^(\w||-)+/)[0]

export const appsAvailableToClusterLoader = createContextLoader(
  ActionDataKeys.AppsAvailableToCluster,
  async ({ clusterId }) => {
    Bugsnag.leaveBreadcrumb('Attempting to get apps available to cluster', { clusterId })
    const charts: any = await helm.getChartsForCluster(clusterId)
    return charts.map((chart) => ({
      ...chart,
      repository: parseRepoName(chart.Name),
    }))
  },
  {
    uniqueIdentifier: ['Name'],
    indexBy: 'clusterId',
  },
)

export const appActions = createCRUDActions(ActionDataKeys.Apps, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get all apps')
    const apps = await helm.getCharts()
    return apps.map((app) => {
      return {
        id: app.Name,
        repository: parseRepoName(app.Name),
        ...app,
      }
    })
  },

  uniqueIdentifier: 'id',
  entityName: 'App Catalog',
  selectorCreator: makeAppsSelector,
})
