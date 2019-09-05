import {
  mergeLeft, path, filter, reverse, identity, sortBy, prop, pluck, map, pipe, pathEq, head, props,
  values, groupBy, propEq, join, find, unless, isNil,
} from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { asyncFlatMap } from 'utils/fp'
import { allKey, imageUrlRoot } from 'app/constants'
import { parseClusterParams, clustersDataKey } from 'k8s/components/infrastructure/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { pathJoin } from 'utils/misc'
import moment from 'moment'
import createContextLoader from 'core/helpers/createContextLoader'

const { qbert } = ApiClient.getInstance()

const uniqueIdentifier = 'id'
const indexBy = 'clusterId'

export const appActions = createCRUDActions('apps', {
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

export const releaseActions = createCRUDActions('releases', {
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

createContextLoader('repositoriesByCluster', async (params, loadFromContext) => {
  const monocularClusters = await loadFromContext(clustersDataKey, {
    appCatalogClusters: true,
    hasControlPlane: true,
  })
  return asyncFlatMap(map(props(['uuid', 'name']), monocularClusters), async ([clusterId, clusterName]) => {
    const clusterRepos = await qbert.getRepositoriesForCluster(clusterId)
    return clusterRepos.map(mergeLeft({ clusterId, clusterName }))
  })
}, {
  dataMapper: pipe(
    groupBy(prop('id')),
    values,
    map(sameIdRepos => ({
      ...head(sameIdRepos),
      clusters: pluck('clusterName', sameIdRepos),
    })),
  ),
})

export const repositoryActions = createCRUDActions('repositories', {
  listFn: async (params, loadFromContext) => {
    return qbert.getRepositories()
  },
  entityName: 'Repository',
  indexBy,
  uniqueIdentifier,
  refetchCascade: true,
  dataMapper: async (items, params, loadFromContext) => {
    const reposByCluster = await loadFromContext('repositoriesByCluster')

    return map(({ id, type, attributes }) => ({
      id,
      type,
      name: attributes.name,
      url: attributes.URL,
      source: attributes.source,
      clusters: pipe(
        find(propEq('id', id)),
        prop('clusters'),
        unless(isNil, join(', ')),
      )(reposByCluster),
      // clusters,
    }), items)
  },
  sortWith: (items, { orderBy = 'name', orderDirection = 'asc' }) =>
    pipe(
      sortBy(prop(orderBy)),
      orderDirection === 'asc' ? identity : reverse,
    )(items),
})
