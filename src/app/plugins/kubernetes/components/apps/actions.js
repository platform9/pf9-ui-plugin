import { flatten } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import createContextLoader from 'core/helpers/createContextLoader'
import { someAsync, mapAsync } from 'utils/async'
import { ActionDataKeys } from 'k8s/DataKeys'
import namespaceActions from '../namespaces/actions'

const { helm } = ApiClient.getInstance()

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
  ActionDataKeys.ReleaseDetail,
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
    // uniqueIdentifier: ['Name', 'clusterId'],
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
    },
  },
  uniqueIdentifier: 'id',
  entityName: 'App Catalog',
})

export const releaseActions = createCRUDActions(ActionDataKeys.Releases, {
  listFn: async ({ clusterId, namespace }) => {
    console.log('action', namespace)
    if (clusterId === allKey) {
      const clusters = await clusterActions.list()
      const results = mapAsync(async (cluster) => {
        const namespaces = await namespaceActions.list({ clusterId: cluster.uuid })
        const results = someAsync(
          namespaces.map(async (namespace) => await helm.getReleases(clusterId, namespace.name)),
        ).then(flatten)
        return results
      }, clusters)
      return flatten(results)
    } else {
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
    }
  },
  updateFn: async ({
    clusterId,
    namespace,
    releaseName,
    action,
    version = undefined,
    values = undefined,
  }) => {
    const body = {
      Name: releaseName,
      Action: action,
      Version: version,
      Vals: values,
    }
    return helm.updateRelease(clusterId, namespace, body)
  },
  deleteFn: async ({ clusterId, namespace, releaseName }) => {
    const data = {
      Name: releaseName,
    }
    await helm.deleteRelease(clusterId, namespace, data)
  },
  uniqueIdentifier: 'Name',
  indexBy: ['clusterId', 'namespace'],
})
