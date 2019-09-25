import {
  mergeLeft, filter, identity, prop, pluck, map, pipe, pathEq, head, props, values, groupBy, propEq,
  find, propOr, pick, F,
} from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { emptyArr, objSwitchCase, pathStr } from 'utils/fp'
import { allKey, imageUrlRoot, addError, deleteError, updateError } from 'app/constants'
import { parseClusterParams, clustersCacheKey } from 'k8s/components/infrastructure/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { pathJoin } from 'utils/misc'
import moment from 'moment'
import createContextLoader from 'core/helpers/createContextLoader'
import { tryCatchAsync, flatMapAsync } from 'utils/async'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'id'

export const singleAppCacheKey = 'appDetails'
export const appsCacheKey = 'apps'
export const appVersionsCacheKey = 'appVersions'
export const releasesCacheKey = 'releases'
export const repositoriesWithClustersCacheKey = 'repositoriesWithClusters'
export const repositoriesCacheKey = 'repositories'

export const appDetailLoader = createContextLoader(singleAppCacheKey, async ({ clusterId, appId, release, version }) => {
  const chart = await qbert.getChart(clusterId, appId, release, version)
  return {
    ...chart,
    readmeMarkdown: await qbert.getChartReadmeContents(clusterId, chart.attributes.readme),
  }
}, {
  uniqueIdentifier,
  indexBy: ['clusterId', 'appId', 'release', 'version'],
  dataMapper: async (items, { clusterId }) => {
    const monocularUrl = await qbert.clusterMonocularBaseUrl(clusterId, null)
    return map(({ id, ...item }) => {
      const icon = pathStr('attributes.icons.0.path', item)
      const chartId = id.substring(0, id.indexOf(':')) // Remove the version from the ID
      return {
        ...item,
        id: chartId,
        name: chartId.substring(chartId.indexOf('/') + 1),
        logoUrl: icon ? pathJoin(monocularUrl, icon) : `${imageUrlRoot}/default-app-logo.png`,
        home: pathStr('relationships.chart.data.home', item),
        sources: pathStr('relationships.chart.data.sources', item),
        maintainers: pathStr('relationships.chart.data.maintainers', item),
      }
    })(items)
  },
})

export const appVersionLoader = createContextLoader(appVersionsCacheKey, async ({ clusterId, appId, release }) => {
  return qbert.getChartVersions(clusterId, appId, release)
}, {
  indexBy: ['clusterId', 'appId', 'release'],
  dataMapper: map(item => ({
    ...item,
    version: pathStr('attributes.version', item),
    appVersion: pathStr('attributes.app_version', item),
    versionLabel: [
      pathStr('attributes.version', item),
      moment(pathStr('attributes.created', item)).format('MMM DD, YYYY'),
    ].join(' - '),
    downloadLink: pathStr('attributes.urls.0', item),
  })),
  defaultOrderBy: 'version',
  defaultOrderDirection: 'desc',
})

export const appActions = createCRUDActions(appsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return flatMapAsync(qbert.getCharts, pluck('uuid', clusters))
    }
    return qbert.getCharts(clusterId)
  },
  customOperations: {
    deploy: async ({ clusterId, ...body }) => {
      await qbert.deployApplication(clusterId, body)
      // Force a refetch of the deployed apps list
      releaseActions.invalidateCache()
    },
  },
  errorMessage: (prevItems, { releaseName }, catchedError, operation) => objSwitchCase({
    deploy: `Error when deploying App ${releaseName}`,
  })(operation),
  successMessage: (updatedItems, prevItems, { name }, operation) => objSwitchCase({
    deploy: `Successfully deployed App ${name}`,
  })(operation),
  entityName: 'App Catalog',
  uniqueIdentifier,
  indexBy: 'clusterId',
  dataMapper: async (items, { clusterId, repositoryId }) => {
    const monocularUrl = await qbert.clusterMonocularBaseUrl(clusterId, null)
    const filterByRepo = repositoryId && repositoryId !== allKey
      ? filter(pathEq(['attributes', 'repo', 'name'], repositoryId))
      : identity
    const normalize = map(item => {
      const icon = pathStr('relationships.latestChartVersion.data.icons.0.path', item)
      return {
        ...item,
        name: pathStr('attributes.name', item),
        description: pathStr('attributes.description', item),
        created: moment(pathStr('relationships.latestChartVersion.data.created', item)),
        logoUrl: icon ? pathJoin(monocularUrl, icon) : `${imageUrlRoot}/default-app-logo.png`,
      }
    })
    return pipe(
      filterByRepo,
      normalize,
    )(items)
  },
  defaultOrderBy: 'name',
})

export const releaseActions = createCRUDActions(releasesCacheKey, {
  listFn: async (params, loadFromContext) => {
    const [clusterId, clusters] = await parseClusterParams(params, loadFromContext)
    if (clusterId === allKey) {
      return flatMapAsync(qbert.getReleases, pluck('uuid', clusters))
    }
    return qbert.getReleases(clusterId)
  },
  uniqueIdentifier,
  indexBy: 'clusterId',
})

const reposWithClustersLoader = createContextLoader(repositoriesWithClustersCacheKey, async (params,
  loadFromContext) => {
  const monocularClusters = await loadFromContext(clustersCacheKey, {
    appCatalogClusters: true,
    hasControlPanel: true,
  })
  const data = await flatMapAsync(async ([clusterId, clusterName]) => {
    const clusterRepos = await qbert.getRepositoriesForCluster(clusterId)
    return clusterRepos.map(mergeLeft({ clusterId, clusterName }))
  }, map(props(['uuid', 'name']), monocularClusters))
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

export const repositoryActions = createCRUDActions(repositoriesCacheKey, {
  listFn: async () => {
    return qbert.getRepositories()
  },
  createFn: async ({ clusters, ...data }) => {
    const result = await qbert.createRepository(data)

    const addResults = await tryCatchAsync(() => flatMapAsync(
      clusterId => qbert.createRepositoryForCluster(clusterId, data),
      clusters,
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
      const deleteResults = await tryCatchAsync(() => flatMapAsync(
        clusterId => qbert.deleteRepositoriesForCluster(clusterId, id),
        itemsToRemove,
      ), F)(null)
      const addResults = await tryCatchAsync(() => flatMapAsync(
        clusterId => qbert.createRepositoryForCluster(clusterId, body),
        itemsToAdd,
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
    const reposWithClusters = await loadFromContext(repositoriesWithClustersCacheKey)
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
