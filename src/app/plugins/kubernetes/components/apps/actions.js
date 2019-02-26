import { flatten, prop } from 'ramda'

const loadClusterApps = context => async cluster => {
  return context.apiClient.qbert.getCharts(cluster.uuid).then(prop('data'))
}

export const loadApps = async ({
  data,
  context,
  setContext,
  params,
  reload
}) => {
  const { clusterId = '__all__' } = params
  if (!reload && context[clusterId]) {
    return context[clusterId]
  }
  const loadClusterAppsFromContext = loadClusterApps(context)
  const apps = clusterId === '__all__'
    ? await Promise.all(context.clusters.map(loadClusterAppsFromContext)).then(flatten)
    : await loadClusterAppsFromContext(context.clusters.find(cluster => cluster.uuid === clusterId))

  setContext({ apps })
  return apps
}

const loadClusterReleases = context => async cluster => {
  return context.apiClient.qbert.getReleases(cluster.uuid).then(prop('data'))
}

export const loadReleases = async ({
  data,
  context,
  setContext,
  params,
  reload
}) => {
  const { clusterId = '__all__' } = params
  if (!reload && context[clusterId]) {
    return context[clusterId]
  }
  const loadClusterReleasesFromContext = loadClusterReleases(context)

  const releases = clusterId === '__all__'
    ? await Promise.all(context.clusters.map(loadClusterReleasesFromContext)).then(flatten)
    : await loadClusterReleasesFromContext(context.clusters.find(cluster => cluster.uuid === clusterId))

  setContext({ releases })
  return releases
}

export const deleteRelease = async ({
  data,
  context,
  setContext,
  params,
  reload
}) => {
  // TODO
}

export const loadRepositories = async ({
  data,
  context,
  setContext,
  params,
  reload
}) => {
  const repositories = await context.apiClient.qbert.getRepositories().then(prop('data'))
  setContext({ repositories })
  return repositories
}

export const deleteRepository = async ({
  data,
  context,
  setContext,
  params,
  reload
}) => {
  // TODO
}

export const editApp = async ({ id, context, setContext }) => {}

export const downloadApp = async () => {}

export const deleteApp = async () => {}

export const addAppToEnvironment = async () => {}

export const deployApp = async () => {}
