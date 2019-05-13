import { pathOrNull } from 'utils/fp'
import { pathOr, prop, propEq } from 'ramda'
import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

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

const mapAsyncItems = async (values, loaderFn, mapFn) => {
  const promises = values.map(loaderFn)
  const responses = await Promise.all(promises)
  const items = responses.flat().map(mapFn)
  return items
}

export const loadClusterTags = contextLoader('clusterTags', async ({ apiClient, loadFromContext }) => {
  await loadFromContext('clusters')
  return apiClient.appbert.getClusterTags()
})

const hasMonitoring = cluster => cluster.tags.includes('pf9-system:monitoring')

export const loadPrometheusInstances = contextLoader('prometheusInstances', async ({ apiClient, loadFromContext }) => {
  const clusterTags = await loadFromContext('clusterTags')
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))
  return mapAsyncItems(clusterUuids, apiClient.qbert.getPrometheusInstances, mapPrometheusInstance)
})

export const loadPrometheusRules = contextLoader('prometheusRules', async ({ apiClient, loadFromContext }) => {
  const clusterTags = await loadFromContext('clusterTags')
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))
  return mapAsyncItems(clusterUuids, apiClient.qbert.getPrometheusRules, mapRule)
})

export const loadPrometheusServiceMonitors = contextLoader('prometheusServiceMonitors', async ({ apiClient, loadFromContext }) => {
  const clusterTags = await loadFromContext('clusterTags')
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))
  return mapAsyncItems(clusterUuids, apiClient.qbert.getPrometheusServiceMonitors, mapServiceMonitor)
})

export const loadPrometheusAlertManagers = contextLoader('prometheusAlertManagers', async ({ apiClient, loadFromContext }) => {
  const clusterTags = await loadFromContext('clusterTags')
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))
  return mapAsyncItems(clusterUuids, apiClient.qbert.getPrometheusAlertManagers, mapAlertManager)
})

export const createPrometheusInstance = contextUpdater('prometheusInstances', async ({ data, apiClient, currentItems }) => {
  const createdInstance = await apiClient.qbert.createPrometheusInstance(data.cluster, data)
  return [...currentItems, mapPrometheusInstance({clusterUuid: data.cluster, ...createdInstance})]
})

export const loadServiceAccounts = contextLoader('serviceAccounts', async ({ apiClient, data }) => {
  return apiClient.qbert.getServiceAccounts(data.clusterUuid, data.namespace)
})

export const deletePrometheusInstance = contextUpdater('prometheusInstances', async ({ id, apiClient, currentItems }) => {
  const instance = currentItems.find(propEq('id', id))
  if (!instance) {
    console.error(`Unable to find prometheus instance with id: ${id} in deletePrometheusInstance`)
    return
  }
  await apiClient.qbert.deletePrometheusInstance(instance.clusterUuid, instance.namespace, instance.name)
  return currentItems.filter(x => x.id !== id)
})

export const deletePrometheusRule = contextUpdater('prometheusRules', async ({ id, currentItems, apiClient }) => {
  const calcId = x => `${x.clusterUuid}-${x.namespace}-${x.name}`
  const rule = currentItems.find(rule => id === calcId(rule))
  if (!rule) {
    console.error(`Unable to find prometheus rule with id: ${id} in deletePrometheusrule`)
    return
  }
  await apiClient.qbert.deletePrometheusRule(rule.clusterUuid, rule.namespace, rule.name)
  return currentItems.filter(x => calcId(x) !== calcId(rule))
})

export const deletePrometheusServiceMonitor = contextUpdater('prometheusServiceMonitors', async ({ id, currentItems, apiClient }) => {
  const calcId = x => `${x.clusterUuid}-${x.namespace}-${x.name}`
  const sm = currentItems.find(rule => id === calcId(rule))
  if (!sm) {
    console.error(`Unable to find prometheus service monitor with id: ${id} in deletePrometheusServiceMonitor`)
    return
  }
  await apiClient.qbert.deletePrometheusServiceMonitor(sm.clusterUuid, sm.namespace, sm.name)
  return currentItems.filter(x => calcId(x) !== calcId(sm))
})

export const deletePrometheusAlertManager = contextUpdater('prometheusAlertManagers', async ({ id, currentItems, apiClient }) => {
  const calcId = x => `${x.clusterUuid}-${x.namespace}-${x.name}`
  const am = currentItems.find(rule => id === calcId(rule))
  if (!am) {
    console.error(`Unable to find prometheus alert manager with id: ${id} in deletePrometheusAlertManager`)
    return
  }
  await apiClient.qbert.deletePrometheusAlertManager(am.clusterUuid, am.namespace, am.name)
  return currentItems.filter(x => calcId(x) !== calcId(am))
})
