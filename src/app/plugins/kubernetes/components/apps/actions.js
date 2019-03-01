import { flatten, prop, pathOr, propEq } from 'ramda'

const loadClusterApps = context => async cluster => {
  return context.apiClient.qbert.getCharts(cluster.uuid).then(prop('data'))
}

export const loadApps = async ({
  data,
  context,
  setContext,
  params,
  reload,
}) => {
  const clusters = (context.clusters || []).filter(x => x.hasMasterNode)
  const { clusterId = pathOr('__all__', [0, 'uuid'], clusters) } = params || {}
  if (!reload && context[clusterId]) {
    return context[clusterId]
  }
  const loadClusterAppsFromContext = loadClusterApps(context)
  const apps = clusterId === '__all__'
    ? await Promise.all(clusters.map(loadClusterAppsFromContext)).then(flatten)
    : await loadClusterAppsFromContext(clusters.find(propEq('uuid', clusterId)))

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
  reload,
}) => {
  const clusters = (context.clusters || []).filter(x => x.hasMasterNode)
  const { clusterId = '__all__' } = params
  if (!reload && context[clusterId]) {
    return context[clusterId]
  }
  const loadClusterReleasesFromContext = loadClusterReleases(context)

  const releases = clusterId === '__all__'
    ? await Promise.all(clusters.map(loadClusterReleasesFromContext)).then(flatten)
    : await loadClusterReleasesFromContext(clusters.find(propEq('uuid', clusterId)))

  setContext({ releases })
  return releases
}

export const deleteRelease = async ({
  data,
  context,
  setContext,
  params,
  reload,
}) => {
  // TODO
}

export const loadRepositories = async ({
  data,
  context,
  setContext,
  params,
  reload,
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
  reload,
}) => {
  // TODO
}

export const editApp = async ({ id, context, setContext }) => {}

export const downloadApp = async () => {}

export const deleteApp = async () => {}

export const addAppToEnvironment = async () => {}

export const deployApp = async () => {}
