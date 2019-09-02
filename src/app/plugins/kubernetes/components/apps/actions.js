import { path, filter, reverse, identity, sortBy, prop, pluck, map, pipe, pathEq } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { asyncFlatMap } from 'utils/fp'
import { allKey, imageUrlRoot } from 'app/constants'
import { parseClusterParams } from 'k8s/components/infrastructure/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { pathJoin } from 'utils/misc'

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
  dataMapper: async (items, { clusterId, repositoryId }) => {
    const monocularUrl = await qbert.clusterMonocularBaseUrl(clusterId, null)
    return pipe(
      repositoryId && repositoryId !== allKey
        ? filter(pathEq(['attributes', 'repo', 'name'], repositoryId))
        : identity,
      map(item => {
        const icon = path(['relationships', 'latestChartVersion', 'data', 'icons', 0, 'path'], item)
        return {
          ...item,
          appLogoUrl: icon ? pathJoin(monocularUrl, icon) : `${imageUrlRoot}/default-app-logo.png`,
        }
      }),
    )(items)
  },
  uniqueIdentifier,
  indexBy,
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

export const repositoryActions = createCRUDActions('repositories', {
  listFn: async (params) => {
    const { clusterId = allKey } = params
    if (clusterId === allKey) {
      return qbert.getRepositories()
    }
    return qbert.getRepositoriesForCluster(clusterId)
  },
  entityName: 'Repository',
  indexBy,
  uniqueIdentifier,
  dataMapper: map(({ id, type, attributes }) => ({
    id,
    type,
    name: attributes.name,
    url: attributes.URL,
    source: attributes.source,
  })),
  sortWith: (items, { orderBy = 'name', orderDirection = 'asc' }) =>
    pipe(
      sortBy(prop(orderBy)),
      orderDirection === 'asc' ? identity : reverse,
    )(items),
})
