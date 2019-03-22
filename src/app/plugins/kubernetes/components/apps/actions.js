import { flatten, prop, propEq } from 'ramda'
import { withCluster } from 'core/helpers/withCluster'

const loadClusterApps = context => async cluster => {
  return context.apiClient.qbert.getCharts(cluster.uuid).then(prop('data'))
}

export const loadApps = withCluster(async ({ data, context, setContext, params: { clusterId } }) => {
  const clusters = (context.clusters || []).filter(x => x.hasMasterNode)
  const loadClusterAppsFromContext = loadClusterApps(context)
  const apps = clusterId === '__all__'
    ? await Promise.all(clusters.map(loadClusterAppsFromContext)).then(flatten)
    : await loadClusterAppsFromContext(clusters.find(propEq('uuid', clusterId)))

  setContext({ apps })
  return apps
})

const loadClusterReleases = context => async cluster => {
  return context.apiClient.qbert.getReleases(cluster.uuid).then(prop('data'))
}

export const loadReleases = withCluster(async ({ data, context, setContext, params: { clusterId } }) => {
  const clusters = (context.clusters || []).filter(x => x.hasMasterNode)
  const loadClusterReleasesFromContext = loadClusterReleases(context)
  const releases = clusterId === '__all__'
    ? await Promise.all(clusters.map(loadClusterReleasesFromContext)).then(flatten)
    : await loadClusterReleasesFromContext(clusters.find(propEq('uuid', clusterId)))

  setContext({ releases })
  return releases
})

export const deleteRelease = async ({ data, context, setContext, params, reload }) => {
  // TODO
}

export const loadRepositories = async ({ data, context, setContext, params }) => {
  const repositories = await context.apiClient.qbert.getRepositories().then(prop('data'))
  setContext({ repositories })
  return repositories
}

export const deleteRepository = async ({ data, context, setContext, params, reload }) => {
  // TODO
}

export const editApp = async ({ id, context, setContext }) => {}

export const downloadApp = async () => {}

export const deleteApp = async () => {}

export const addAppToEnvironment = async () => {}

export const deployApp = async () => {}
