import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import store from 'app/store'
import { cacheActions } from 'core/caching/cacheReducers'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import DataKeys, { ActionDataKeys } from 'k8s/DataKeys'
import { pluck } from 'ramda'
import { appActions } from '../apps/actions'

const { helm } = ApiClient.getInstance()
const { dispatch } = store

export const repositoriesForClusterLoader = createContextLoader(
  DataKeys.RepositoriesForCluster,
  async ({ clusterId }) => {
    console.log('clusterid', clusterId)
    if (clusterId !== allKey) {
      const repos: any = await helm.getRepositoriesForCluster(clusterId)
      return repos.map((repo) => ({ ...repo, clusterId }))
    }
  },
  {
    entityName: 'Repositories For Cluster',
    uniqueIdentifier: ['name'],
    indexBy: ['clusterId'],
  },
)

export const repositoryActions = createCRUDActions(ActionDataKeys.Repositories, {
  listFn: async () => {
    const [repos]: any = await Promise.all([helm.getRepositories(), appActions.list()])
    return repos.map((repo) => {
      const clusterIds = pluck<any, string>('cluster_uuid', repo.clusters)
      return {
        ...repo.repo,
        clusters: clusterIds,
      }
    })
  },
  createFn: async ({ name, url, username, password }) => {
    const body = {
      name,
      url,
      username: username || undefined,
      password: password || undefined,
    }
    const result = await helm.createRepository(body)
    // Refresh the list of apps
    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.Apps }))
    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.RepositoriesForCluster }))
    return result
  },
  updateFn: async ({ name, url, username, password }) => {
    const body = {
      name,
      url,
      username: username || undefined,
      password: password || undefined,
    }
    return helm.updateRepositoryCredentials(body)
  },
  deleteFn: async ({ name }) => {
    await helm.deleteRepository(name)
    // Refresh the list of apps
    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.Apps }))
    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.RepositoriesForCluster }))
  },
  customOperations: {
    updateRepositories: async ({ repositories }, currentItems) => {
      const body = repositories.map((repo) => ({ name: repo.name }))
      await helm.updateRepositories(body)
      return currentItems
    },
    addRepoToClusters: async ({ repoName, clusterIds }, currentItems) => {
      const body = clusterIds.map((id) => ({ cluster_uuid: id }))
      await helm.addRepoToClusters(repoName, body)
      dispatch(cacheActions.clearCache({ cacheKey: DataKeys.RepositoriesForCluster }))
      return currentItems.map((repo) =>
        repo.name === repoName ? { ...repo, clusters: [...repo.clusters, ...clusterIds] } : repo,
      )
    },
    deleteRepoFromClusters: async ({ repoName, clusterIds }, currentItems) => {
      const body = clusterIds.map((id) => ({ cluster_uuid: id }))
      await helm.deleteRepoFromClusters(repoName, body)
      dispatch(cacheActions.clearCache({ cacheKey: DataKeys.RepositoriesForCluster }))
      return currentItems.map((repo) => {
        if (repo.name !== repoName) {
          return repo
        } else {
          const clusters = repo.clusters.filter((id) => !clusterIds.includes(id))
          return {
            ...repo,
            clusters,
          }
        }
      })
    },
  },
  entityName: 'Repository',
  uniqueIdentifier: 'name',
  defaultOrderBy: 'name',
})

// const repos: any = await helm.getRepositoriesForCluster(clusterId)
// return repos.map((repo) => ({ ...repo, clusterId }))
