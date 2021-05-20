import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import store from 'app/store'
import { cacheActions } from 'core/caching/cacheReducers'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import DataKeys, { ActionDataKeys } from 'k8s/DataKeys'
import { pluck } from 'ramda'
import { trackEvent } from 'utils/tracking'
import { appActions } from '../actions'

const { helm } = ApiClient.getInstance()
const { dispatch } = store

export const repositoriesForClusterLoader = createContextLoader(
  DataKeys.RepositoriesForCluster,
  async ({ clusterId }) => {
    Bugsnag.leaveBreadcrumb('Attempting to get repositories for cluster', { clusterId })
    if (clusterId !== allKey) {
      const repos: any = await helm.getRepositoriesForCluster(clusterId)
      return repos.map((repo) => ({ ...repo, clusterId }))
    }
  },
  {
    entityName: 'Repositories For Cluster',
    uniqueIdentifier: ['name'],
    indexBy: 'clusterId',
  },
)

export const repositoryActions = createCRUDActions(ActionDataKeys.Repositories, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get all repositories')
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
    Bugsnag.leaveBreadcrumb('Attempting to create repository', { name, url, username, password })
    const body = {
      name,
      url,
      username: username || undefined,
      password: password || undefined,
    }
    const result = await helm.createRepository(body)

    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.Apps }))
    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.RepositoriesForCluster }))

    trackEvent('Add Repository', {
      name,
      url,
    })

    return result
  },
  updateFn: async ({ name, url, username, password }) => {
    const body = {
      name,
      url,
      username: username || undefined,
      password: password || undefined,
    }
    Bugsnag.leaveBreadcrumb('Attempting to update repository', { name, url })
    const result = await helm.updateRepositoryCredentials(body)
    trackEvent('Update Repository', { name, url })
    return result
  },
  deleteFn: async ({ name }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete repository', { name })

    await helm.deleteRepository(name)

    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.Apps }))
    dispatch(cacheActions.clearCache({ cacheKey: DataKeys.RepositoriesForCluster }))

    trackEvent('Remove Repository', {
      name,
    })
  },
  customOperations: {
    updateRepositories: async ({ repositories }, currentItems) => {
      Bugsnag.leaveBreadcrumb('Attempting to update repositories', { repositories })
      const body = repositories.map((repo) => ({ name: repo.name }))
      await helm.updateRepositories(body)
      trackEvent('Update Repositories', { repositories })
      return currentItems
    },
    addClustersToRepository: async ({ repoName, clusterIds }, currentItems) => {
      Bugsnag.leaveBreadcrumb('Attempting to attach clusters to repository', {
        repoName,
        clusterIds,
      })
      const body = clusterIds.map((id) => ({ cluster_uuid: id }))
      await helm.addClustersToRepository(repoName, body)

      dispatch(cacheActions.clearCache({ cacheKey: DataKeys.RepositoriesForCluster }))
      dispatch(cacheActions.clearCache({ cacheKey: DataKeys.AppsAvailableToCluster }))

      trackEvent('Attach Clusters to Repository', { repoName, clusterIds })
      return currentItems.map((repo) =>
        repo.name === repoName ? { ...repo, clusters: [...repo.clusters, ...clusterIds] } : repo,
      )
    },
    deleteClustersFromRepository: async ({ repoName, clusterIds }, currentItems) => {
      Bugsnag.leaveBreadcrumb('Attempting to delete clusters from repository', {
        repoName,
        clusterIds,
      })
      const body = clusterIds.map((id) => ({ cluster_uuid: id }))
      await helm.deleteClustersFromRepository(repoName, body)

      dispatch(cacheActions.clearCache({ cacheKey: DataKeys.RepositoriesForCluster }))
      dispatch(cacheActions.clearCache({ cacheKey: DataKeys.AppsAvailableToCluster }))

      trackEvent('Detach Clusters From Repository', { repoName, clusterIds })
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
