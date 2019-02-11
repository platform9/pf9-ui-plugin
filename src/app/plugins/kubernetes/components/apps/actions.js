import { flatten, prop } from 'ramda'

export const loadClusters = async ({ data, context, setContext, reload }) => {
  if (!reload && context.clusters) {
    return context.clusters
  }
  const clusters = await context.apiClient.qbert.getClusters()
  setContext({ clusters })
  return clusters
}

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

export const editApp = async ({ id, context, setContext }) => {}

export const downloadApp = async () => {}

export const deleteApp = async () => {}

export const addAppToEnvironment = async () => {}

export const deployApp = async () => {}
