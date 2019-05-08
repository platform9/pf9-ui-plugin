import { pathOrNull } from 'utils/fp'
import { pathOr, prop, propEq } from 'ramda'
import { loadClusters } from '../infrastructure/actions'

const mapServiceMonitor = ({ clusterUuid, metadata, spec }) => ({
  clusterUuid,
  name: metadata.name,
  namespace: metadata.namespace,
  labels: metadata.labels,
  port: spec.endpoints.map(prop('port')).join(', '),
  selector: spec.selector.matchLabels,
})

const mapRule = ({ clusterUuid, metadata, spec }) => ({
  clusterUuid,
  name: metadata.name,
  namespace: metadata.namespace,
  labels: metadata.labels,
})

const mapAlertManager = ({ clusterUuid, metadata, spec }) => ({
  clusterUuid,
  name: metadata.name,
  namespace: metadata.namespace,
  replicas: spec.replicas,
  labels: metadata.labels,
})

export const mapPrometheusInstance = ({ clusterUuid, metadata, spec }) => ({
  clusterUuid,
  name: metadata.name,
  namespace: metadata.namespace,
  id: metadata.uid,
  serviceMonitorSelector: pathOrNull('serviceMonitorSelector.matchLabels', spec),
  alertManagersSelector:
    pathOr([], ['alerting', 'alertmanagers'], spec)
      .join(', '),
  ruleSelector: pathOrNull('ruleSelector.matchLabels', spec),
  cpu: pathOrNull('resources.requests.cpu', spec),
  storage: pathOrNull('resources.requests.storage', spec),
  memory: pathOrNull('resources.requests.memory', spec),
  version: metadata.resourceVersion,
  retention: spec.retention,
  replicas: spec.replicas,
  metadata,
  spec,
})

const getPrometheusInstances = uuid => context.apiClient.qbert.getPrometheusInstances(uuid)
const getServiceMonitors = uuid => context.apiClient.qbert.getPrometheusServiceMonitors(uuid)
const getRules = uuid => context.apiClient.qbert.getPrometheusRules(uuid)
const getAlertManagers = uuid => context.apiClient.qbert.getPrometheusAlertManagers(uuid)

const mapAsyncItems = async (values, loaderFn, mapFn) => {
  const promises = values.map(loaderFn)
  const responses = await Promise.all(promises)
  const items = responses.flat().map(mapFn)
  return items
}

export const loadClusterTags = async ({ context, setContext, reload }) => {
  const clusterTags = await context.apiClient.appbert.getClusterTags()
  setContext({ clusterTags })
  return clusterTags
}

export const loadPrometheusResources = async ({ context, setContext, reload }) => {
  if (!reload && context.prometheusInstances) { return context.prometheusInstances }

  const [_, clusterTags] = await Promise.all([ // eslint-disable-line no-unused-vars
    loadClusters({ context, setContext, reload }),
    loadClusterTags({ context, setContext, reload })
  ])

  const hasMonitoring = cluster => cluster.tags.includes('pf9-system:monitoring')
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))

  const prometheusInstances = await mapAsyncItems(clusterUuids, getPrometheusInstances, mapPrometheusInstance)
  setContext({ prometheusInstances })

  const prometheusServiceMonitors = await mapAsyncItems(clusterUuids, getServiceMonitors, mapServiceMonitor)

  const prometheusRules = await mapAsyncItems(clusterUuids, getRules, mapRule)

  const prometheusAlertManagers = await mapAsyncItems(clusterUuids, getAlertManagers, mapAlertManager)

  setContext({ prometheusServiceMonitors, prometheusRules, prometheusAlertManagers })

  return prometheusInstances
}

export const loadPrometheusRules = async ({ context, setContext, reload }) => {
  await loadPrometheusResources(({ context, setContext, reload }))
  return context.prometheusRules
}

export const loadPrometheusServiceMonitors = async ({ context, setContext, reload }) => {
  await loadPrometheusResources(({ context, setContext, reload }))
  return context.prometheusServiceMonitors
}

export const loadPrometheusAlertManagers = async ({ context, setContext, reload }) => {
  await loadPrometheusResources(({ context, setContext, reload }))
  return context.prometheusAlertManagers
}

export const createPrometheusInstance = async ({ data, context, setContext }) => {
  const createdInstance = await context.apiClient.qbert.createPrometheusInstance(data.cluster, data)
  return createdInstance
}

export const loadServiceAccounts = async ({ data, context, setContext }) => {
  const serviceAccounts = await context.apiClient.qbert.getServiceAccounts(data.clusterUuid, data.namespace)
  return serviceAccounts
}

export const deletePrometheusInstance = async ({ id, context, setContext }) => {
  const instance = context.prometheusInstances.find(propEq('id', id))
  if (!instance) {
    console.error(`Unable to find prometheus instance with id: ${id} in deletePrometheusInstance`)
    return // eslint-disable-line no-useless-return
  }
  // TODO: waiting on documentation from backend team on how to do DELETE calls
}
