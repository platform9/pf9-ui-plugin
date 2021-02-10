import {
  mergeLeft,
  filter,
  prop,
  pluck,
  map,
  pipe,
  head,
  values,
  groupBy,
  propEq,
  find,
  propOr,
  pick,
  F,
  flatten,
} from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { objSwitchCase, pathStr } from 'utils/fp'
import { allKey, imageUrlRoot, addError, deleteError, updateError } from 'app/constants'
import {
  makeAppDetailsSelector,
  makeDeploymentDetailsSelector,
  makeAppVersionSelector,
  makeAppsSelector,
  makeReleasesSelector,
  repositoriesSelector,
} from './selectors'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clusterActions, parseClusterParams } from 'k8s/components/infrastructure/clusters/actions'
import { pathJoin } from 'utils/misc'
import createContextLoader from 'core/helpers/createContextLoader'
import { tryCatchAsync, someAsync, flatMapAsync, pipeAsync, mapAsync } from 'utils/async'
import { ActionDataKeys } from 'k8s/DataKeys'

const { qbert, helm } = ApiClient.getInstance()

const uniqueIdentifier = 'id'

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
  async ({ clusterId, release }) => {
    return qbert.getRelease(clusterId, release)
  },
  {
    uniqueIdentifier,
    indexBy: ['clusterId', 'release'],
    selectorCreator: makeDeploymentDetailsSelector,
  },
)

export const appVersionLoader = createContextLoader(
  ActionDataKeys.AppVersions,
  async ({ clusterId, appId, release }) => {
    return qbert.getChartVersions(clusterId, appId, release)
  },
  {
    indexBy: ['clusterId', 'appId', 'release'],
    defaultOrderBy: 'version',
    defaultOrderDirection: 'desc',
    selectorCreator: makeAppVersionSelector,
  },
)

const parseRepoName = (name) => name.match(/^(\w||-)+/)[0]

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
    deploy: async ({ clusterId, namespace, body }) => {
      console.log(clusterId, namespace)
      helm.deployChart(clusterId, namespace, body)
    },
  },
  uniqueIdentifier: 'id',
  entityName: 'App Catalog',
})

export const releaseActions = createCRUDActions(ActionDataKeys.Releases, {
  listFn: async (params) => {
    const [clusterId, clusters] = await parseClusterParams(params)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getReleases)).then(flatten)
    }
    return qbert.getReleases(clusterId)
  },
  deleteFn: async (params) => {
    return qbert.deleteRelease(params.clusterId, params.id)
  },
  uniqueIdentifier,
  indexBy: 'clusterId',
  selectorCreator: makeReleasesSelector,
})

const reposWithClustersLoader = createContextLoader(
  ActionDataKeys.RepositoriesWithClusters,
  async () => {
    const monocularClusters = await clusterActions.list({
      appCatalogClusters: true,
      hasControlPanel: true,
    })
    return pipeAsync(
      map(async ({ uuid: clusterId, name: clusterName }) => {
        const clusterRepos = await qbert.getRepositoriesForCluster(clusterId)
        return clusterRepos.map(mergeLeft({ clusterId, clusterName }))
      }),
      someAsync,
      flatten,
      groupBy(prop(uniqueIdentifier)),
      values,
      map((sameIdRepos) => ({
        ...head(sameIdRepos),
        clusters: map(pick(['clusterId', 'clusterName']), sameIdRepos),
      })),
    )(monocularClusters)
  },
  {
    uniqueIdentifier,
    entityName: 'Repository with Clusters',
  },
)
