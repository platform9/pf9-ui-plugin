import { flatten, prop, propEq } from 'ramda'
import { withCluster } from 'core/helpers/withCluster'
import contextLoader from 'core/helpers/contextLoader'

const getClusterApps = context => async cluster => {
  return context.apiClient.qbert.getCharts(cluster.uuid).then(prop('data'))
}

export const loadApps = contextLoader(({ clusterId }) => {
  return ['apps', clusterId || '__all__']
}, withCluster(async ({ context, clusters, params: { clusterId } }) => {
  const loadClusterAppsFromContext = getClusterApps(context)
  return clusterId === '__all__'
    ? Promise.all(clusters.map(loadClusterAppsFromContext)).then(flatten)
    : loadClusterAppsFromContext(clusters.find(propEq('uuid', clusterId)))
}))

const getClusterReleases = context => async cluster => {
  return context.apiClient.qbert.getReleases(cluster.uuid).then(prop('data'))
}

export const loadReleases = contextLoader('releases', withCluster(async ({ context, clusters, params: { clusterId } }) => {
  const loadClusterReleasesFromContext = getClusterReleases(context)
  return clusterId === '__all__'
    ? Promise.all(clusters.map(loadClusterReleasesFromContext)).then(flatten)
    : loadClusterReleasesFromContext(clusters.find(propEq('uuid', clusterId)))
}))

export const deleteRelease = async ({ data, context, setContext, reload }) => {
  // TODO
}

export const loadRepositories = contextLoader('repositories', async ({ context }) => {
  return context.apiClient.qbert.getRepositories().then(prop('data'))
})

export const deleteRepository = async ({ data, context, setContext, params, reload }) => {
  // TODO
}

export const editApp = async ({ id, context, setContext }) => {}

export const downloadApp = async () => {}

export const deleteApp = async () => {}

export const addAppToEnvironment = async () => {}

export const deployApp = async () => {}
