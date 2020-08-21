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
import DataKeys from 'k8s/DataKeys'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'id'

export const appDetailLoader = createContextLoader(
  DataKeys.AppDetails,
  async ({ clusterId, id, release, version }) => {
    const chart = await qbert.getChart(clusterId, id, release, version)
    const monocularUrl = await qbert.clusterMonocularBaseUrl(clusterId, null)
    const icon = pathStr('attributes.icons.0.path', chart)
    return {
      ...chart,
      logoUrl: icon ? pathJoin(monocularUrl, icon) : `${imageUrlRoot}/default-app-logo.png`,
      readmeMarkdown: await qbert.getChartReadmeContents(clusterId, chart.attributes.readme),
    }
  },
  {
    uniqueIdentifier: ['id', 'clusterId'],
    indexBy: ['clusterId', 'id', 'release', 'version'],
    selectorCreator: makeAppDetailsSelector,
  },
)

export const deploymentDetailLoader = createContextLoader(
  DataKeys.ReleaseDetail,
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
  DataKeys.AppVersions,
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

export const appActions = createCRUDActions(DataKeys.Apps, {
  listFn: async (params) => {
    const [clusterId, clusters] = await parseClusterParams(params)
    const apps =
      clusterId === allKey
        ? await someAsync(pluck('uuid', clusters).map(qbert.getCharts)).then(flatten)
        : await qbert.getCharts(clusterId)

    return mapAsync(async (chart) => {
      const monocularUrl = await qbert.clusterMonocularBaseUrl(clusterId, null)
      const icon = pathStr('attributes.icons.0.path', chart)
      return {
        ...chart,
        logoUrl: icon ? pathJoin(monocularUrl, icon) : `${imageUrlRoot}/default-app-logo.png`,
        readmeMarkdown: await qbert.getChartReadmeContents(clusterId, chart.attributes.readme),
      }
    }, apps)
  },
  customOperations: {
    deploy: async ({ clusterId, ...body }) => {
      await qbert.deployApplication(clusterId, body)
      // Force a refetch of the deployed apps list
      releaseActions.invalidateCache()
    },
  },
  errorMessage: (prevItems, { releaseName }, catchedError, operation) =>
    objSwitchCase({
      deploy: `Error when deploying App ${releaseName}`,
    })(operation),
  successMessage: (updatedItems, prevItems, { name }, operation) =>
    objSwitchCase({
      deploy: `Successfully deployed App ${name}`,
    })(operation),
  entityName: 'App Catalog',
  uniqueIdentifier: ['id', 'clusterId'],
  indexBy: 'clusterId',
  defaultOrderBy: 'name',
  selectorCreator: makeAppsSelector,
})

export const releaseActions = createCRUDActions(DataKeys.Releases, {
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
  DataKeys.RepositoriesWithClusters,
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

const getRepoName = (id, repos) =>
  id ? pipe(find(propEq(uniqueIdentifier, id)), propOr(id, 'name'))(repos) : ''

export const repositoryActions = createCRUDActions(DataKeys.Repositories, {
  listFn: async () => {
    return qbert.getRepositories()
  },
  createFn: async ({ clusters, ...data }) => {
    const result = await qbert.createRepository(data)

    const addResults = await tryCatchAsync(
      () =>
        flatMapAsync((clusterId) => qbert.createRepositoryForCluster(clusterId, data), clusters),
      F,
    )(null)

    if (!addResults) {
      // TODO: figure out a way to show toast notifications with non-blocking errors
      console.warn('Error when trying to add repo to cluster')
    }
    return result
  },
  deleteFn: async ({ id }) => {
    await qbert.deleteRepository(id)
  },
  customOperations: {
    updateRepoClusters: async ({ id, clusters }, prevItems) => {
      const repository = find(propEq(uniqueIdentifier, id), prevItems)
      const prevSelectedClusters = pluck('clusterId', repository.clusters)
      const body = {
        name: repository.name,
        URL: repository.url,
        source: repository.source,
      }
      const itemsToRemove = filter((clusterId) => {
        return !clusters.includes(clusterId)
      }, prevSelectedClusters)
      const itemsToAdd = filter((clusterId) => {
        return !prevSelectedClusters.includes(clusterId)
      }, clusters)

      // Invalidate the Repositories with Clusters cache so that we force a refetch of the data
      reposWithClustersLoader.invalidateCache()

      // Perfom the update operations, return FALSE if there has been any error
      const deleteResults = await tryCatchAsync(
        () =>
          flatMapAsync(
            (clusterId) => qbert.deleteRepositoriesForCluster(clusterId, id),
            itemsToRemove,
          ),
        F,
      )(null)
      const addResults = await tryCatchAsync(
        () =>
          flatMapAsync(
            (clusterId) => qbert.createRepositoryForCluster(clusterId, body),
            itemsToAdd,
          ),
        F,
      )(null)

      // Check if there has been any errors
      if (!deleteResults && !addResults) {
        throw new Error(updateError)
      }
      if (!deleteResults) {
        throw new Error(deleteError)
      }
      if (!addResults) {
        throw new Error(addError)
      }
    },
  },
  entityName: 'Repository',
  uniqueIdentifier,
  refetchCascade: true,
  successMessage: (updatedItems, prevItems, { id, name }, operation) =>
    objSwitchCase({
      create: `Successfully created Repository ${name}`,
      delete: `Successfully deleted Repository ${getRepoName(id, prevItems)}`,
      updateRepoClusters: `Successfully edited cluster access for repository ${getRepoName(
        id,
        prevItems,
      )}`,
    })(operation),
  errorMessage: (prevItems, { id, name }, catchedErr, operation) =>
    objSwitchCase({
      create: objSwitchCase(
        {
          [addError]: `Repository ${name} could not be added to cluster `,
        },
        `Error when trying to create a ${name} repository`,
      )(catchedErr.message),
      delete: `Error when trying to delete Repository ${getRepoName(id, prevItems)}`,
      updateRepoClusters: objSwitchCase(
        {
          [deleteError]: `Repository ${getRepoName(
            id,
            prevItems,
          )} could not be removed from cluster `,
          [addError]: `Repository ${getRepoName(id, prevItems)} could not be added to cluster `,
        },
        `Error when updating cluster access for repository ${getRepoName(id, prevItems)}`,
      )(catchedErr.message),
    })(operation),
  defaultOrderBy: 'name',
  selector: repositoriesSelector,
})
