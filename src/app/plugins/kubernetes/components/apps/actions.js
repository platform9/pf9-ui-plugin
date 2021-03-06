import { flatten } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import createContextLoader from 'core/helpers/createContextLoader'
import { someAsync, mapAsync } from 'utils/async'
import { ActionDataKeys } from 'k8s/DataKeys'
import namespaceActions from '../namespaces/actions'
import { makeDeployedAppsSelector } from './selectors'
import store from 'app/store'
import { cacheActions } from 'core/caching/cacheReducers'

const { helm } = ApiClient.getInstance()
const { dispatch } = store

export const appDetailsLoader = createContextLoader(
  ActionDataKeys.AppDetails,
  async ({ repository, name, infoType = 'all', versions = true }) => {
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

export const deploymentDetailLoader = createContextLoader(
  ActionDataKeys.DeployedAppDetails,
  async ({ clusterId, namespace, releaseName }) => {
    const details = helm.getReleaseInfo(clusterId, namespace, releaseName)
    return details
  },
  {
    uniqueIdentifier: 'Name',
    indexBy: ['clusterId', 'namespace', 'releaseName'],
  },
)

const parseRepoName = (name) => name.match(/^(\w||-)+/)[0]

export const appsAvailableToClusterLoader = createContextLoader(
  ActionDataKeys.AppsAvailableToCluster,
  async ({ clusterId }) => {
    const charts = await helm.getChartsForCluster(clusterId)
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
    const apps = await helm.getCharts()
    return apps.map((app) => {
      return {
        id: app.Name,
        repository: parseRepoName(app.Name),
        Score: app.Score,
        ...app.Chart,
      }
    })
  },
  customOperations: {
    deploy: async ({
      clusterId,
      namespace,
      deploymentName,
      repository,
      chartName,
      version,
      dry = false,
      values = undefined,
    }) => {
      const body = {
        Name: deploymentName,
        Chart: `${repository}/${chartName}`,
        Dry: dry,
        Version: version,
        Vals: values,
      }
      await helm.deployChart(clusterId, namespace, body)
      dispatch(cacheActions.clearCache({ cacheKey: ActionDataKeys.DeployedApps }))
    },
  },
  uniqueIdentifier: 'id',
  entityName: 'App Catalog',
})

export const deployedAppActions = createCRUDActions(ActionDataKeys.DeployedApps, {
  listFn: async ({ clusterId, namespace }) => {
    if (namespace === allKey) {
      const namespaces = await namespaceActions.list({ clusterId })
      const releases = someAsync(
        namespaces.map(async (namespace) => await helm.getReleases(clusterId, namespace.name)),
      ).then(flatten)
      return releases
    } else {
      const release = await helm.getReleases(clusterId, namespace)
      return release
    }
  },
  updateFn: async ({
    clusterId,
    namespace,
    deploymentName,
    repository,
    chart,
    action,
    version = undefined,
    values = undefined,
  }) => {
    const body = {
      Name: deploymentName,
      Chart: `${repository}/${chart}`,
      Action: action,
      Version: version,
      Vals: values,
    }
    const result = helm.updateRelease(clusterId, namespace, body)
    // Is it possible to invalidate the DeployedAppsDetails for just one specific app deployment
    // instead of invalidating the entire cache?
    dispatch(cacheActions.clearCache({ cacheKey: ActionDataKeys.DeployedAppDetails }))
    return result
  },
  deleteFn: async ({ clusterId, namespace, name }) => {
    const data = {
      Name: name,
    }
    await helm.deleteRelease(clusterId, namespace, data)
  },
  uniqueIdentifier: 'name',
  indexBy: ['clusterId', 'namespace'],
  selectorCreator: makeDeployedAppsSelector,
})
