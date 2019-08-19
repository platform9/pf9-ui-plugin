import { switchCase, pathOrNull } from 'utils/fp'
import { pipe, last, pathOr, prop, propEq } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { clustersContextKey } from '../infrastructure/actions'
import { notFoundErr } from 'app/constants'

export const clusterTagsContextKey = 'clusterTags'
export const prometheusInstancesContextKey = 'prometheusInstances'
export const serviceAccountsContextKey = 'serviceAccounts'
export const prometheusRulesContextKey = 'prometheusRules'
export const prometheusServiceMonitorsContextKey = 'prometheusServiceMonitors'
export const prometheusAlertManagersContextKey = 'prometheusAlertManagers'

const mapAsyncItems = async (values, loaderFn, mapFn) => {
  const promises = values.map(loaderFn)
  const responses = await Promise.all(promises)
  return responses.flat().map(mapFn)
}

export const loadClusterTags = createContextLoader(clusterTagsContextKey, async (params, loadFromContext) => {
  const { appbert } = ApiClient.getInstance()
  await loadFromContext(clustersContextKey)
  return appbert.getClusterTags()
})

const hasMonitoring = cluster => cluster.tags.includes('pf9-system:monitoring')

/* Prometheus Instances */

export const mapPrometheusInstance = ({ clusterUuid, metadata, spec }) => ({
  clusterUuid,
  name: metadata.name,
  namespace: metadata.namespace,
  uid: metadata.uid,
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
  dashboard: pathOr('', ['annotations', 'service_path'], metadata),
  metadata,
  spec,
})

export const loadPrometheusInstances = createContextLoader(prometheusInstancesContextKey, async (params, loadFromContext) => {
  const { qbert } = ApiClient.getInstance()
  const clusterTags = await loadFromContext(clusterTagsContextKey)
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))
  return mapAsyncItems(clusterUuids, qbert.getPrometheusInstances, mapPrometheusInstance)
})

export const createPrometheusInstance = createContextUpdater(prometheusInstancesContextKey, async ({ data, apiClient, currentItems, showToast }) => {
  const { qbert } = ApiClient.getInstance()
  const createdInstance = await qbert.createPrometheusInstance(data.cluster, data)
  return mapPrometheusInstance({ clusterUuid: data.cluster, ...createdInstance })
}, {
  operation: 'create',
  successMessage: updatedItems => `Successfully created Prometheus instance ${last(updatedItems).name}`
})

export const deletePrometheusInstance = createContextUpdater(prometheusInstancesContextKey, async ({ id, apiClient, currentItems }) => {
  const { qbert } = ApiClient.getInstance()
  const instance = currentItems.find(propEq('uid', id))
  if (!instance) {
    throw new Error(notFoundErr)
  }
  await qbert.deletePrometheusInstance(instance.clusterUuid, instance.namespace, instance.name)
}, {
  operation: 'delete',
  successMessage: (updatedItems, prevItems, { id }) => `Successfully deleted Prometheus instance ${pipe(
    find(propEq('uid', id)),
    prop('name')
  )(prevItems)}`,
  errorMessage: (catchedErr, { id }) => switchCase({
    [notFoundErr]: `Unable to find prometheus instance with id: ${id} in deletePrometheusInstance`,
  }, `Error when trying to delete Prometheus instance with id: ${id}`
  )(catchedErr.message),
})

export const updatePrometheusInstance = createContextUpdater(prometheusInstancesContextKey, async data => {
  const { qbert } = ApiClient.getInstance()
  const response = await qbert.updatePrometheusInstance(data)
  return mapPrometheusInstance(response)
}, {
  operation: 'update',
  successMessage: (updatedItems, prevItems, { id }) => `Successfully updated Prometheus instance ${pipe(
    find(propEq('uid', id)),
    prop('name')
  )(updatedItems)}`,
})

/* Service Accounts */

export const loadServiceAccounts = createContextLoader(serviceAccountsContextKey, async data => {
  const { qbert } = ApiClient.getInstance()
  return qbert.getServiceAccounts(data.clusterUuid, data.namespace)
})

/* Prometheus Rules */

const mapRule = ({ clusterUuid, metadata, spec }) => ({
  uid: metadata.uid,
  clusterUuid,
  name: metadata.name,
  namespace: metadata.namespace,
  labels: metadata.labels,
  rules: pathOr([], ['groups', 0, 'rules'], spec),
})

export const loadPrometheusRules = createContextLoader(prometheusRulesContextKey, async (params, loadFromContext) => {
  const { qbert } = ApiClient.getInstance()
  const clusterTags = await loadFromContext(clusterTagsContextKey)
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))
  return mapAsyncItems(clusterUuids, qbert.getPrometheusRules, mapRule)
})

export const updatePrometheusRules = createContextUpdater(prometheusRulesContextKey, async data => {
  const { qbert } = ApiClient.getInstance()
  const response = await qbert.updatePrometheusRules(data)
  return mapRule(response)
}, {
  operation: 'update',
  successMessage: (updatedItems, prevItems, { id }) => `Successfully updated Prometheus rule ${pipe(
    find(propEq('uid', id)),
    prop('name')
  )(updatedItems)}`,
})

export const deletePrometheusRule = createContextUpdater(prometheusRulesContextKey, async ({ id, apiClient, currentItems, showToast }) => {
  const { qbert } = ApiClient.getInstance()
  const rule = currentItems.find(propEq('uid', id))
  if (!rule) {
    throw new Error(notFoundErr)
  }
  await qbert.deletePrometheusRule(rule.clusterUuid, rule.namespace, rule.name)
}, {
  operation: 'delete',
  successMessage: (updatedItems, prevItems, { id }) => `Successfully deleted Prometheus rule ${pipe(
    find(propEq('uid', id)),
    prop('name')
  )(prevItems)}`,
  errorMessage: (catchedErr, { id }) => switchCase({
    [notFoundErr]: `Unable to find prometheus rule with id: ${id} in deletePrometheusRule`,
  }, `Error when trying to delete Prometheus rule with id: ${id}`
  )(catchedErr.message),
})

/* Service Monitors */

const mapServiceMonitor = ({ clusterUuid, metadata, spec }) => ({
  uid: metadata.uid,
  clusterUuid,
  name: metadata.name,
  namespace: metadata.namespace,
  labels: metadata.labels,
  port: spec.endpoints.map(prop('port')).join(', '),
  selector: spec.selector.matchLabels,
})

export const loadPrometheusServiceMonitors = createContextLoader(prometheusServiceMonitorsContextKey, async () => {
  const { qbert } = ApiClient.getInstance()
  const clusterTags = await loadClusterTags()
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))
  return mapAsyncItems(clusterUuids, qbert.getPrometheusServiceMonitors, mapServiceMonitor)
})

export const updatePrometheusServiceMonitor = createContextUpdater(prometheusServiceMonitorsContextKey, async data => {
  const { qbert } = ApiClient.getInstance()
  const response = await qbert.updatePrometheusServiceMonitor(data)
  return mapServiceMonitor(response)
}, {
  operation: 'update',
  successMessage: (updatedItems, prevItems, { id }) => `Successfully updated Prometheus ServiceMonitor ${pipe(
    find(propEq('uid', id)),
    prop('name')
  )(updatedItems)}`,
})

export const deletePrometheusServiceMonitor = createContextUpdater(prometheusServiceMonitorsContextKey, async ({ id, currentItems, apiClient, showToast }) => {
  const { qbert } = ApiClient.getInstance()
  const sm = currentItems.find(propEq('uid', id))
  if (!sm) {
    throw new Error(notFoundErr)
  }
  await qbert.deletePrometheusServiceMonitor(sm.clusterUuid, sm.namespace, sm.name)
}, {
  operation: 'delete',
  successMessage: (updatedItems, prevItems, { id }) => `Successfully deleted Prometheus service monitor ${pipe(
    find(propEq('uid', id)),
    prop('name')
  )(prevItems)}`,
  errorMessage: (catchedErr, { id }) => switchCase({
    [notFoundErr]: `Unable to find prometheus service monitor with id: ${id} in deletePrometheusServiceMonitor`,
  }, `Error when trying to delete Prometheus service monitor with id: ${id}`
  )(catchedErr.message),
})

/* Alert Managers */

const mapAlertManager = ({ clusterUuid, metadata, spec }) => ({
  uid: metadata.uid,
  clusterUuid,
  name: metadata.name,
  namespace: metadata.namespace,
  replicas: spec.replicas,
  labels: metadata.labels,
})

export const loadPrometheusAlertManagers = createContextLoader(prometheusAlertManagersContextKey, async () => {
  const { qbert } = ApiClient.getInstance()
  const clusterTags = await loadClusterTags()
  const clusterUuids = clusterTags.filter(hasMonitoring).map(prop('uuid'))
  return mapAsyncItems(clusterUuids, qbert.getPrometheusAlertManagers, mapAlertManager)
})

export const updatePrometheusAlertManager = createContextUpdater(prometheusAlertManagersContextKey, async data => {
  const { qbert } = ApiClient.getInstance()
  const response = await qbert.updatePrometheusAlertManager(data)
  return mapAlertManager(response)
}, {
  operation: 'update',
  successMessage: (updatedItems, prevItems, { id }) => `Successfully updated Prometheus Alert Manager ${pipe(
    find(propEq('uid', id)),
    prop('name')
  )(updatedItems)}`,
})

export const deletePrometheusAlertManager = createContextUpdater(prometheusAlertManagersContextKey, async ({ id, currentItems, apiClient, showToast }) => {
  const { qbert } = ApiClient.getInstance()
  const am = currentItems.find(propEq('uid', id))
  if (!am) {
    throw new Error(notFoundErr)
  }
  await qbert.deletePrometheusAlertManager(am.clusterUuid, am.namespace, am.name)
}, {
  operation: 'delete',
  successMessage: (updatedItems, prevItems, { id }) => `Successfully deleted Prometheus Alert Manager ${pipe(
    find(propEq('uid', id)),
    prop('name')
  )(prevItems)}`,
  errorMessage: (catchedErr, { id }) => switchCase({
    [notFoundErr]: `Unable to find prometheus Alert Manager with id: ${id} in deletePrometheusAlertManager`,
  }, `Error when trying to delete Prometheus Alert Manager with id: ${id}`
  )(catchedErr.message),
})
