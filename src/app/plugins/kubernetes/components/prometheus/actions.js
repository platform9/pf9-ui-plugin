import { pathOrNull, objSwitchCase } from 'utils/fp'
import { map, pathEq, find, pluck, curry, pipe, last, pathOr, prop, propEq } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { clustersCacheKey } from '../infrastructure/actions'
import { notFoundErr } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { flatMapAsync } from 'utils/async'

const { appbert, qbert } = ApiClient.getInstance()
const uniqueIdentifier = 'metadata.uid'
const getName = (id, items) => pipe(
  find(propEq('uid', id)),
  prop('name'),
)(items)
const hasMonitoring = cluster => cluster.tags.includes('pf9-system:monitoring')

export const clusterTagsCacheKey = 'clusterTags'
export const clusterTagActions = createCRUDActions(clusterTagsCacheKey, {
  listFn: async (params, loadFromContext) => {
    await loadFromContext(clustersCacheKey)
    return appbert.getClusterTags()
  },
  uniqueIdentifier,
})

/* Prometheus Instances */

export const mapPrometheusInstance = curry((clusters, { clusterUuid, metadata, spec }) => ({
  clusterUuid,
  clusterName: pipe(find(propEq('uuid', clusterUuid)), prop('name'))(clusters),
  name: metadata.name,
  namespace: metadata.namespace,
  uid: metadata.uid,
  serviceMonitorSelector: pathOrNull('serviceMonitorSelector.matchLabels', spec),
  alertManagersSelector: pathOr([], ['alerting', 'alertmanagers'], spec).join(', '),
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
}))
export const prometheusInstancesCacheKey = 'prometheusInstances'
export const prometheusInstanceActions = createCRUDActions(prometheusInstancesCacheKey, {
  listFn: async (params, loadFromContext) => {
    const clusterTags = await loadFromContext(clusterTagsCacheKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))

    return flatMapAsync(qbert.getPrometheusInstances, clusterUuids)
  },
  createFn: async data => {
    return qbert.createPrometheusInstance(data.cluster, data)
  },
  deleteFn: async ({ uid }, currentItems) => {
    const instance = currentItems.find(pathEq(['metadata', 'uid'], uid))
    if (!instance) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusInstance(instance.clusterUuid, instance.namespace, instance.name)
  },
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    return items.map(mapPrometheusInstance(clusters))
  },
  successMessage: (updatedItems, prevItems, { uid }, operation) => objSwitchCase({
    create: `Successfully created Prometheus instance ${prop('name', last(updatedItems))}`,
    delete: `Successfully deleted Prometheus instance ${getName(uid, prevItems)}`,
  })(operation),
  uniqueIdentifier,
})

/* Service Accounts */

export const serviceAccountsCacheKey = 'serviceAccounts'
export const serviceAccountActions = createCRUDActions(serviceAccountsCacheKey, {
  listFn: async params => {
    return qbert.getServiceAccounts(params.clusterId, params.namespace)
  },
  dataMapper: map(({ clusterUuid, metadata, spec }) => ({
    uid: metadata.uid,
    name: metadata.name,
    namespace: metadata.namespace,
    labels: metadata.labels,
  })),
  indexBy: ['clusterId', 'namespace'],
  uniqueIdentifier,
})

/* Rules */

export const prometheusRulesCacheKey = 'prometheusRules'
export const prometheusRuleActions = createCRUDActions(prometheusRulesCacheKey, {
  listFn: async (params, loadFromContext) => {
    const clusterTags = await loadFromContext(clusterTagsCacheKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
    return flatMapAsync(qbert.getPrometheusRules, clusterUuids)
  },
  updateFn: async data => {
    return qbert.updatePrometheusRules(data)
  },
  deleteFn: async ({ id }, currentItems) => {
    const rule = currentItems.find(propEq('uid', id))
    if (!rule) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusRule(rule.clusterUuid, rule.namespace, rule.name)
  },
  successMessage: (updatedItems, prevItems, { uid }, operation) => objSwitchCase({
    create: `Successfully created Prometheus rule ${prop('name', last(updatedItems))}`,
    delete: `Successfully deleted Prometheus rule ${getName(uid, prevItems)}`,
  })(operation),
  dataMapper: map(({ clusterUuid, metadata, spec }) => ({
    uid: metadata.uid,
    clusterUuid,
    name: metadata.name,
    namespace: metadata.namespace,
    labels: metadata.labels,
    rules: pathOr([], ['groups', 0, 'rules'], spec),
  })),
  uniqueIdentifier,
})

/* Service Monitors */

export const prometheusServiceMonitorsCacheKey = 'prometheusServiceMonitors'
export const prometheusServiceMonitorActions = createCRUDActions(prometheusServiceMonitorsCacheKey, {
  listFn: async (params, loadFromContext) => {
    const clusterTags = await loadFromContext(clusterTagsCacheKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
    return flatMapAsync(qbert.getPrometheusServiceMonitors, clusterUuids)
  },
  updateFn: async data => {
    return qbert.updatePrometheusServiceMonitor(data)
  },
  deleteFn: async ({ id }, currentItems) => {
    const sm = currentItems.find(propEq('uid', id))
    if (!sm) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusServiceMonitor(sm.clusterUuid, sm.namespace, sm.name)
  },
  successMessage: (updatedItems, prevItems, { uid }, operation) => objSwitchCase({
    create: `Successfully created Prometheus Service Monitor ${prop('name', last(updatedItems))}`,
    delete: `Successfully deleted Prometheus Service Monitor ${getName(uid, prevItems)}`,
  })(operation),
  dataMapper: map(({ clusterUuid, metadata, spec }) => ({
    uid: metadata.uid,
    clusterUuid,
    name: metadata.name,
    namespace: metadata.namespace,
    labels: metadata.labels,
    port: spec.endpoints.map(prop('port')).join(', '),
    selector: spec.selector.matchLabels,
  })),
  uniqueIdentifier,
})

/* Alert Managers */

export const prometheusAlertManagersCacheKey = 'prometheusAlertManagers'
export const prometheusAlertManagerActions = createCRUDActions(prometheusAlertManagersCacheKey, {
  listFn: async (params, loadFromContext) => {
    const clusterTags = await loadFromContext(clusterTagsCacheKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
    return flatMapAsync(qbert.getPrometheusAlertManagers, clusterUuids)
  },
  updateFn: async data => {
    return qbert.updatePrometheusAlertManager(data)
  },
  deleteFn: async ({ id }, currentItems) => {
    const am = currentItems.find(propEq('uid', id))
    if (!am) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusAlertManager(am.clusterUuid, am.namespace, am.name)
  },
  successMessage: (updatedItems, prevItems, { uid }, operation) => objSwitchCase({
    create: `Successfully created Prometheus Alert Manager ${prop('name', last(updatedItems))}`,
    delete: `Successfully deleted Prometheus Alert Manager ${getName(uid, prevItems)}`,
  })(operation),
  dataMapper: map(({ clusterUuid, metadata, spec }) => ({
    uid: metadata.uid,
    clusterUuid,
    name: metadata.name,
    namespace: metadata.namespace,
    replicas: spec.replicas,
    labels: metadata.labels,
  })),
  uniqueIdentifier,
})
