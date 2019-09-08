import {
  mergeLeft, path, filter, reverse, identity, sortBy, prop, pluck, map, pipe, pathEq, head, props,
  values, groupBy, propEq, find, propOr, pick,
} from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { asyncFlatMap, emptyArr, objSwitchCase } from 'utils/fp'
import { allKey, imageUrlRoot } from 'app/constants'
import { parseClusterParams, clustersDataKey } from 'k8s/components/infrastructure/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { pathJoin } from 'utils/misc'
import moment from 'moment'
import createContextLoader from 'core/helpers/createContextLoader'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'id'
const indexBy = 'clusterId'

const appsDataKey = 'apps'
const releasesDataKey = 'releases'
const repositoriesWithClustersDataKey = 'repositoriesWithClusters'
const repositoriesDataKey = 'repositories'

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
  indexBy,
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
  indexBy,
})

const repositoriesWithClusters = createContextLoader(repositoriesWithClustersDataKey, async (params,
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
    groupBy(prop('id')),
    values,
    map(sameIdRepos => ({
      ...head(sameIdRepos),
      clusters: map(pick(['clusterId', 'clusterName']), sameIdRepos),
    })),
  )(data)
}, {
  uniqueIdentifier,
})

const getRepoName = (id, repos) => prop('name', find(propEq('id', id), repos))
export const repositoryActions = createCRUDActions(repositoriesDataKey, {
  listFn: async (params, loadFromContext) => {
    return qbert.getRepositories()
  },
  deleteFn: async ({ id }) => {
    await qbert.deleteRepository(id)
  },
  customOperations: {
    updateRepoClusters: async ({ id, clusters }, prevItems) => {
      const repository = find(propEq('id', id), prevItems)
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

      // Invalidate the Repositories by Clusters cache so that we force a refetch of the data
      repositoriesWithClusters.invalidateCache()

      // Perfom the update operations sequentially, for safety
      await asyncFlatMap(
        itemsToRemove,
        clusterId => qbert.deleteRepositoriesForCluster(clusterId, id),
        false,
      )
      await asyncFlatMap(
        itemsToAdd,
        clusterId => qbert.createRepositoryForCluster(clusterId, body),
        false,
      )
    },
  },
  entityName: 'Repository',
  uniqueIdentifier,
  refetchCascade: true,
  successMessage: (updatedItems, prevItems, { id }, operation) => objSwitchCase({
    delete: `Successfully deleted Repository ${getRepoName(id, prevItems)}`,
    updateRepoClusters: `Successfully edited cluster access for repository ${getRepoName(id, prevItems)}`,
  })(operation),
  errorMessage: (prevItems, { id }, operation) => objSwitchCase({
    delete: `Error when trying to delete Repository ${getRepoName(id, prevItems)}`,
    updateRepoClusters: `Error when updating cluster access for repository ${getRepoName(id, prevItems)}`,
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
        find(propEq('id', id)),
        propOr(emptyArr, 'clusters'),
      )(reposWithClusters),
    }))(items)
  },
  sortWith:
    (items, { orderBy = 'name', orderDirection = 'asc' }) =>
      pipe(
        sortBy(prop(orderBy)),
        orderDirection === 'asc' ? identity : reverse,
      )(items),
})
