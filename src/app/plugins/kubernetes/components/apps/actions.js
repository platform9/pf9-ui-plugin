import {
  mergeLeft, path, filter, reverse, identity, sortBy, prop, pluck, map, pipe, pathEq, head, props,
  values, groupBy, propEq, find, propOr, pick, F,
} from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { asyncFlatMap, emptyArr, objSwitchCase, asyncTryCatch } from 'utils/fp'
import { allKey, imageUrlRoot, addError, deleteError, updateError } from 'app/constants'
import { parseClusterParams, clustersDataKey } from 'k8s/components/infrastructure/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { pathJoin } from 'utils/misc'
import moment from 'moment'
import createContextLoader from 'core/helpers/createContextLoader'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'id'

export const singleAppDataKey = 'singleApp'
export const appsDataKey = 'apps'
export const appVersionsDataKey = 'appVersions'
export const releasesDataKey = 'releases'
export const repositoriesWithClustersDataKey = 'repositoriesWithClusters'
export const repositoriesDataKey = 'repositories'

export const singleAppLoader = createContextLoader(singleAppDataKey, async ({ clusterId, appId, release, version }) => {
  const chart = await qbert.getChart(clusterId, appId, release, version)
  return {
    ...chart,
    readmeMarkdown: await qbert.getChartReadmeContents(chart.attributes.readme)
  }
}, {
  indexBy: ['clusterId', 'appId', 'release', 'version'],
})

export const appVersionLoader = createContextLoader(appVersionsDataKey, async ({ clusterId, appId, release }) => {
  return qbert.getChartVersions(clusterId, appId, release)
}, {
  indexBy: ['clusterId', 'appId', 'release'],
})

export const appActions = createCRUDActions(appsDataKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return asyncFlatMap(pluck('uuid', clusters), qbert.getCharts)
    }
    return qbert.getCharts(clusterId)
  },
  entityName: 'App Catalog',
  uniqueIdentifier,
  indexBy: 'clusterId',
  dataMapper: async (items, { clusterId, repositoryId }) => {
    const monocularUrl = await qbert.clusterMonocularBaseUrl(clusterId, null)
    const filterByRepo = repositoryId && repositoryId !== allKey
      ? filter(pathEq(['attributes', 'repo', 'name'], repositoryId))
      : identity
    const normalize = map(item => {
      const icon = path(['relationships', 'latestChartVersion', 'data', 'icons', 0, 'path'], item)
      return {
        ...item,
        name: path(['attributes', 'name'], item),
        created: path(['relationships', 'latestChartVersion', 'data', 'created'], item),
        appLogoUrl: icon ? pathJoin(monocularUrl, icon) : `${imageUrlRoot}/default-app-logo.png`,
      }
    })

    return pipe(
      filterByRepo,
      normalize,
    )(items)
  },
  sortWith: (items, { orderBy = 'name', orderDirection = 'asc' }) =>
    pipe(
      sortBy(orderBy === 'created' ? pipe(prop(orderBy), moment) : prop(orderBy)),
      orderDirection === 'asc' ? identity : reverse,
    )(items),
})

export const releaseActions = createCRUDActions(releasesDataKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return asyncFlatMap(pluck('uuid', clusters), qbert.getReleases)
    }
    return qbert.getReleases(clusterId)
  },
  uniqueIdentifier,
  indexBy: 'clusterId',
})

const reposWithClustersLoader = createContextLoader(repositoriesWithClustersDataKey, async (params,
  loadFromContext) => {
  const monocularClusters = await loadFromContext(clustersDataKey, {
    appCatalogClusters: true,
    hasControlPlane: true,
  })
  const data = await asyncFlatMap(map(props(['uuid', 'name']), monocularClusters), async ([clusterId, clusterName]) => {
    const clusterRepos = await qbert.getRepositoriesForCluster(clusterId)
    return clusterRepos.map(mergeLeft({ clusterId, clusterName }))
  })
  return pipe(
    groupBy(prop(uniqueIdentifier)),
    values,
    map(sameIdRepos => ({
      ...head(sameIdRepos),
      clusters: map(pick(['clusterId', 'clusterName']), sameIdRepos),
    })),
  )(data)
}, {
  uniqueIdentifier,
  entityName: 'Repository with Clusters',
})

const getRepoName = (id, repos) => id ? pipe(
  find(propEq(uniqueIdentifier, id)),
  propOr(id, 'name'),
)(repos) : ''

export const repositoryActions = createCRUDActions(repositoriesDataKey, {
  listFn: async () => {
    return qbert.getRepositories()
  },
  createFn: async ({ clusters, ...data }) => {
    const result = await qbert.createRepository(data)

    const addResults = await asyncTryCatch(() => asyncFlatMap(clusters,
      clusterId => qbert.createRepositoryForCluster(clusterId, data),
    ), F)(null)

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
      const itemsToRemove = filter(clusterId => {
        return !clusters.includes(clusterId)
      }, prevSelectedClusters)
      const itemsToAdd = filter(clusterId => {
        return !prevSelectedClusters.includes(clusterId)
      }, clusters)

      // Invalidate the Repositories with Clusters cache so that we force a refetch of the data
      reposWithClustersLoader.invalidateCache()

      // Perfom the update operations, return FALSE if there has been any error
      const deleteResults = await asyncTryCatch(() => asyncFlatMap(itemsToRemove,
        clusterId => qbert.deleteRepositoriesForCluster(clusterId, id),
      ), F)(null)
      const addResults = await asyncTryCatch(() => asyncFlatMap(itemsToAdd,
        clusterId => qbert.createRepositoryForCluster(clusterId, body),
      ), F)(null)

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
  successMessage: (updatedItems, prevItems, { id, name }, operation) => objSwitchCase({
    create: `Successfully created Repository ${name}`,
    delete: `Successfully deleted Repository ${getRepoName(id, prevItems)}`,
    updateRepoClusters: `Successfully edited cluster access for repository ${getRepoName(id, prevItems)}`,
  })(operation),
  errorMessage: (prevItems, { id, name }, catchedErr, operation) => objSwitchCase({
    create: objSwitchCase({
      [addError]: `Repository ${name} could not be added to cluster `,
    }, `Error when trying to create a ${name} repository`)(catchedErr.message),
    delete: `Error when trying to delete Repository ${getRepoName(id, prevItems)}`,
    updateRepoClusters: objSwitchCase({
      [deleteError]: `Repository ${getRepoName(id, prevItems)} could not be removed from cluster `,
      [addError]: `Repository ${getRepoName(id, prevItems)} could not be added to cluster `,
    }, `Error when updating cluster access for repository ${getRepoName(id, prevItems)}`)(catchedErr.message),
  })(operation),
  dataMapper: async (items, params, loadFromContext) => {
    const reposWithClusters = await loadFromContext(repositoriesWithClustersDataKey)
    return map(({ id, type, attributes }) => ({
      id,
      type,
      name: attributes.name,
      url: attributes.URL,
      source: attributes.source,
      clusters: pipe(
        find(propEq(uniqueIdentifier, id)),
        propOr(emptyArr, 'clusters'),
      )(reposWithClusters),
    }))(items)
  },
  defaultOrderBy: 'name',
})
