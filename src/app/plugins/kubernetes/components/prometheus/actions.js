import { asyncFlatMap, pathOrNull } from 'utils/fp'
import { map, pathEq, find, pluck, curry, pipe, last, pathOr, prop, propEq } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { clustersDataKey } from '../infrastructure/actions'
import { notFoundErr } from 'app/constants'

export const clusterTagsDataKey = 'clusterTags'
export const prometheusInstancesDataKey = 'prometheusInstances'
export const serviceAccountsDataKey = 'serviceAccounts'
export const prometheusRulesDataKey = 'prometheusRules'
export const prometheusServiceMonitorsDataKey = 'prometheusServiceMonitors'
export const prometheusAlertManagersDataKey = 'prometheusAlertManagers'

const { appbert, qbert } = ApiClient.getInstance()
const uniqueIdentifier = 'metadata.uid'
const getName = (id, items) => pipe(
  find(propEq('uid', id)),
  prop('name'),
)(items)
const hasMonitoring = cluster => cluster.tags.includes('pf9-system:monitoring')

createContextLoader(clusterTagsDataKey, async (params, loadFromContext) => {
  await loadFromContext(clustersDataKey)
  return appbert.getClusterTags()
}, {
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

createContextLoader(prometheusInstancesDataKey, async (params, loadFromContext) => {
  const clusterTags = await loadFromContext(clusterTagsDataKey)
  const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))

  return asyncFlatMap(clusterUuids, qbert.getPrometheusInstances)
}, {
  uniqueIdentifier,
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersDataKey)
    return items.map(mapPrometheusInstance(clusters))
  },
})

createContextUpdater(prometheusInstancesDataKey, async data => {
  return qbert.createPrometheusInstance(data.cluster, data)
}, {
  uniqueIdentifier,
  operation: 'create',
  successMessage: updatedItems =>
    `Successfully created Prometheus instance ${last(updatedItems).name}`,
})

createContextUpdater(prometheusInstancesDataKey, async ({ uid }, currentItems) => {
  const instance = currentItems.find(pathEq(['metadata', 'uid'], uid))
  if (!instance) {
    throw new Error(notFoundErr)
  }
  await qbert.deletePrometheusInstance(instance.clusterUuid, instance.namespace, instance.name)
}, {
  uniqueIdentifier,
  operation: 'delete',
  successMessage: (updatedItems, prevItems, { uid }) =>
    `Successfully deleted Prometheus instance ${pipe(
      find(pathEq(['metadata', 'uid'], uid)),
      prop('name'),
    )(prevItems)}`,
})

createContextUpdater(prometheusInstancesDataKey, async data => {
  return qbert.updatePrometheusInstance(data)
}, {
  uniqueIdentifier,
  operation: 'update',
  successMessage: (updatedItems, prevItems, { id }) =>
    `Successfully updated Prometheus instance ${pipe(
      find(pathEq(['metadata', 'uid'], id)),
      prop('name'),
    )(updatedItems)}`,
})

/* Service Accounts */

const mapService = ({ clusterUuid, metadata, spec }) => ({
  uid: metadata.uid,
  name: metadata.name,
  namespace: metadata.namespace,
  labels: metadata.labels,
})

createContextLoader(serviceAccountsDataKey, async data => {
  return qbert.getServiceAccounts(data.clusterId, data.namespace)
}, {
  uniqueIdentifier,
  indexBy: ['clusterId', 'namespace'],
  dataMapper: map(mapService),
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

createContextLoader(prometheusRulesDataKey, async (params, loadFromContext) => {
  const clusterTags = await loadFromContext(clusterTagsDataKey)
  const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
  return asyncFlatMap(clusterUuids, qbert.getPrometheusRules)
}, {
  uniqueIdentifier,
  dataMapper: map(mapRule),
})

createContextUpdater(prometheusRulesDataKey, async data => {
  return qbert.updatePrometheusRules(data)
}, {
  uniqueIdentifier,
  operation: 'update',
  successMessage: (updatedItems, prevItems, { id }) =>
    `Successfully updated Prometheus rule ${getName(id, updatedItems)}`,
})

createContextUpdater(prometheusRulesDataKey, async ({ id }, currentItems) => {
  const rule = currentItems.find(propEq('uid', id))
  if (!rule) {
    throw new Error(notFoundErr)
  }
  await qbert.deletePrometheusRule(rule.clusterUuid, rule.namespace, rule.name)
}, {
  uniqueIdentifier,
  operation: 'delete',
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

createContextLoader(prometheusServiceMonitorsDataKey, async (params, loadFromContext) => {
  const clusterTags = await loadFromContext(clusterTagsDataKey)
  const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
  return asyncFlatMap(clusterUuids, qbert.getPrometheusServiceMonitors)
}, {
  uniqueIdentifier,
  dataMapper: map(mapServiceMonitor),
})

createContextUpdater(prometheusServiceMonitorsDataKey, async data => {
  return qbert.updatePrometheusServiceMonitor(data)
}, {
  uniqueIdentifier,
  operation: 'update',
  successMessage: (updatedItems, prevItems, { id }) =>
    `Successfully updated Prometheus ServiceMonitor ${getName(id, updatedItems)}`,
})

createContextUpdater(prometheusServiceMonitorsDataKey, async ({ id }, currentItems) => {
  const sm = currentItems.find(propEq('uid', id))
  if (!sm) {
    throw new Error(notFoundErr)
  }
  await qbert.deletePrometheusServiceMonitor(sm.clusterUuid, sm.namespace, sm.name)
}, {
  uniqueIdentifier,
  operation: 'delete',
  successMessage: (updatedItems, prevItems, { id }) =>
    `Successfully deleted Prometheus service monitor ${getName(id, prevItems)}`,
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

createContextLoader(prometheusAlertManagersDataKey, async (params, loadFromContext) => {
  const clusterTags = await loadFromContext(clusterTagsDataKey)
  const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
  return asyncFlatMap(clusterUuids, qbert.getPrometheusAlertManagers)
}, {
  uniqueIdentifier,
  dataMapper: map(mapAlertManager),
})

/**
 * @type contextUpdaterFn
 */
createContextUpdater(prometheusAlertManagersDataKey, async data => {
  return qbert.updatePrometheusAlertManager(data)
}, {
  uniqueIdentifier,
  operation: 'update',
  successMessage: (updatedItems, prevItems, { id }) =>
    `Successfully updated Prometheus Alert Manager ${getName(id, updatedItems)}`,
})

createContextUpdater(prometheusAlertManagersDataKey, async ({ id }, currentItems) => {
  const am = currentItems.find(propEq('uid', id))
  if (!am) {
    throw new Error(notFoundErr)
  }
  await qbert.deletePrometheusAlertManager(am.clusterUuid, am.namespace, am.name)
}, {
  entityName: 'Prometheus Alert Manager',
  uniqueIdentifier,
  operation: 'delete',
  successMessage: (updatedItems, prevItems, { id }) =>
    `Successfully deleted Prometheus Alert Manager ${getName(id, prevItems)}`,
})
