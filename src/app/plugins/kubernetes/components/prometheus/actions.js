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

export const loadPrometheusResources = async ({ context, getContext, setContext, reload }) => {
  if (!reload && context.prometheusInstances) { return context.prometheusInstances }

  const [_, clusterTags] = await Promise.all([ // eslint-disable-line no-unused-vars
    loadClusters({ context, getContext, setContext, reload }),
    loadClusterTags({ context, getContext, setContext, reload })
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
    return
  }
  const response = await context.apiClient.qbert.deletePrometheusInstance(instance.clusterUuid, instance.namespace, instance.name)
  const prometheusInstances = context.prometheusInstances.filter(x => x.id !== id)
  setContext({ prometheusInstances })
  return response
}

export const deletePrometheusRule = async ({ id, context, setContext }) => {
  const calcId = x => `${x.clusterUuid}-${x.namespace}-${x.name}`
  const rule = context.prometheusRules.find(rule => id === calcId(rule))
  if (!rule) {
    console.error(`Unable to find prometheus rule with id: ${id} in deletePrometheusrule`)
    return
  }
  const response = await context.apiClient.qbert.deletePrometheusRule(rule.clusterUuid, rule.namespace, rule.name)
  const prometheusRules = context.prometheusRules.filter(x => calcId(x) !== calcId(rule))
  setContext({ prometheusRules })
  return response
}

export const deletePrometheusServiceMonitor = async ({ id, context, setContext }) => {
  const calcId = x => `${x.clusterUuid}-${x.namespace}-${x.name}`
  const sm = context.prometheusServiceMonitors.find(rule => id === calcId(rule))
  if (!sm) {
    console.error(`Unable to find prometheus service monitor with id: ${id} in deletePrometheusServiceMonitor`)
    return
  }
  const response = await context.apiClient.qbert.deletePrometheusServiceMonitor(sm.clusterUuid, sm.namespace, sm.name)
  const prometheusServiceMonitors = context.prometheusServiceMonitors.filter(x => calcId(x) !== calcId(sm))
  setContext({ prometheusServiceMonitors })
  return response
}

export const deletePrometheusAlertManager = async ({ id, context, setContext }) => {
  const calcId = x => `${x.clusterUuid}-${x.namespace}-${x.name}`
  const am = context.prometheusAlertManagers.find(rule => id === calcId(rule))
  if (!am) {
    console.error(`Unable to find prometheus alert manager with id: ${id} in deletePrometheusAlertManager`)
    return
  }
  const response = await context.apiClient.qbert.deletePrometheusAlertManager(am.clusterUuid, am.namespace, am.name)
  const prometheusAlertManagers = context.prometheusAlertManagers.filter(x => calcId(x) !== calcId(am))
  setContext({ prometheusAlertManagers })
  return response
}
