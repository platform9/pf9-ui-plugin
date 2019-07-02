import { prop, pluck } from 'ramda'
import clusterContextLoader from 'core/helpers/clusterContextLoader'
import contextLoader from 'core/helpers/contextLoader'
import { asyncFlatMap } from 'utils/fp'

export const loadApps = clusterContextLoader(
  'apps',
  async ({ apiClient, params: { clusterId }, loadFromContext }) => {
    const { qbert } = apiClient
    const clusters = await loadFromContext('clusters')
    return !clusterId || clusterId === '__all__'
      ? asyncFlatMap(pluck('uuid', clusters), qbert.getCharts)
      : qbert.getCharts(clusterId)
  })

export const loadReleases = clusterContextLoader(
  'releases',
  async ({ apiClient, params: { clusterId }, loadFromContext }) => {
    const { qbert } = apiClient
    const clusters = await loadFromContext('clusters')
    return !clusterId || clusterId === '__all__'
      ? asyncFlatMap(pluck('uuid', clusters), qbert.getReleases)
      : qbert.getReleases(clusterId)
  })

export const deleteRelease = async ({ data, setContext, reload }) => {
  // TODO
}

export const loadRepositories = contextLoader('repositories',
  async ({ apiClient }) => {
    return apiClient.qbert.getRepositories().then(prop('data'))
  })

export const deleteRepository = async ({ data, setContext, params, reload }) => {
  // TODO
}

export const editApp = async ({ id, context, setContext }) => {}

export const downloadApp = async () => {}

export const deleteApp = async () => {}

export const addAppToEnvironment = async () => {}

export const deployApp = async () => {}
