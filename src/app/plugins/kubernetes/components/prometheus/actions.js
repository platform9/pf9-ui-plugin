import { asyncFlatMap, switchCase, pathOrNull } from 'utils/fp'
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

export const loadClusterTags = createContextLoader(clusterTagsDataKey,
  async (params, loadFromContext) => {
    const { appbert } = ApiClient.getInstance()
    await loadFromContext(clustersDataKey)
    return appbert.getClusterTags()
  }, {
    uniqueIdentifier: 'metadata.uid',
  })

const hasMonitoring = cluster => cluster.tags.includes('pf9-system:monitoring')

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

export const loadPrometheusInstances = createContextLoader(prometheusInstancesDataKey,
  async (params, loadFromContext) => {
    const { qbert } = ApiClient.getInstance()
    const clusterTags = await loadFromContext(clusterTagsDataKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
    return asyncFlatMap(clusterUuids, qbert.getPrometheusInstances)
  }, {
    uniqueIdentifier: 'metadata.uid',
    dataMapper: async (items, params, loadFromContext) => {
      const clusters = await loadFromContext(clustersDataKey)
      return items.map(mapPrometheusInstance(clusters))
    },
  })

export const createPrometheusInstance = createContextUpdater(prometheusInstancesDataKey,
  async data => {
    const { qbert } = ApiClient.getInstance()
    return qbert.createPrometheusInstance(data.cluster, data)
  }, {
    uniqueIdentifier: 'metadata.uid',
    operation: 'create',
    successMessage:
      updatedItems => `Successfully created Prometheus instance ${last(updatedItems).name}`,
  })

export const deletePrometheusInstance = createContextUpdater(prometheusInstancesDataKey,
  async ({ uid }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const instance = currentItems.find(pathEq(['metadata', 'uid'], uid))
    if (!instance) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusInstance(instance.clusterUuid, instance.namespace, instance.name)
  }, {
    uniqueIdentifier: 'metadata.uid',
    operation: 'delete',
    successMessage: (updatedItems, prevItems,
      { uid }) => `Successfully deleted Prometheus instance ${pipe(
      find(pathEq(['metadata', 'uid'], uid)),
      prop('name'),
    )(prevItems)}`,
    errorMessage: (catchedErr, { uid }) => switchCase(
      `Error when trying to delete Prometheus instance with id: ${uid}`,
      [notFoundErr, `Unable to find prometheus instance with id: ${uid} in deletePrometheusInstance`],
    )(catchedErr.message),
  })

export const updatePrometheusInstance = createContextUpdater(prometheusInstancesDataKey,
  async data => {
    const { qbert } = ApiClient.getInstance()
    return qbert.updatePrometheusInstance(data)
  }, {
    uniqueIdentifier: 'metadata.uid',
    operation: 'update',
    successMessage: (updatedItems, prevItems,
      { id }) => `Successfully updated Prometheus instance ${pipe(
      find(pathEq(['metadata', 'uid'], id)),
      prop('name'),
    )(updatedItems)}`,
  })

/* Service Accounts */

export const loadServiceAccounts = createContextLoader(serviceAccountsDataKey,
  async data => {
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

export const loadPrometheusRules = createContextLoader(prometheusRulesDataKey,
  async (params, loadFromContext) => {
    const { qbert } = ApiClient.getInstance()
    const clusterTags = await loadFromContext(clusterTagsDataKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
    return asyncFlatMap(clusterUuids, qbert.getPrometheusRules)
  }, {
    uniqueIdentifier: 'metadata.uid',
    dataMapper: map(mapRule),
  })

export const updatePrometheusRules = createContextUpdater(prometheusRulesDataKey,
  async data => {
    const { qbert } = ApiClient.getInstance()
    return qbert.updatePrometheusRules(data)
  }, {
    uniqueIdentifier: 'metadata.uid',
    operation: 'update',
    successMessage: (updatedItems, prevItems,
      { id }) => `Successfully updated Prometheus rule ${pipe(
      find(propEq('uid', id)),
      prop('name'),
    )(updatedItems)}`,
  })

export const deletePrometheusRule = createContextUpdater(prometheusRulesDataKey,
  async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const rule = currentItems.find(propEq('uid', id))
    if (!rule) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusRule(rule.clusterUuid, rule.namespace, rule.name)
  }, {
    uniqueIdentifier: 'metadata.uid',
    operation: 'delete',
    successMessage: (updatedItems, prevItems,
      { id }) => `Successfully deleted Prometheus rule ${pipe(
      find(propEq('uid', id)),
      prop('name'),
    )(prevItems)}`,
    errorMessage: (catchedErr, { id }) => switchCase(
      `Error when trying to delete Prometheus rule with id: ${id}`,
      [notFoundErr, `Unable to find prometheus rule with id: ${id} in deletePrometheusRule`],
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

export const loadPrometheusServiceMonitors = createContextLoader(prometheusServiceMonitorsDataKey,
  async (params, loadFromContext) => {
    const { qbert } = ApiClient.getInstance()
    const clusterTags = await loadFromContext(clusterTagsDataKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
    return asyncFlatMap(clusterUuids, qbert.getPrometheusServiceMonitors)
  }, {
    uniqueIdentifier: 'metadata.uid',
    dataMapper: map(mapServiceMonitor),
  })

export const updatePrometheusServiceMonitor = createContextUpdater(prometheusServiceMonitorsDataKey,
  async data => {
    const { qbert } = ApiClient.getInstance()
    return qbert.updatePrometheusServiceMonitor(data)
  }, {
    uniqueIdentifier: 'metadata.uid',
    operation: 'update',
    successMessage: (updatedItems, prevItems,
      { id }) => `Successfully updated Prometheus ServiceMonitor ${pipe(
      find(propEq('uid', id)),
      prop('name'),
    )(updatedItems)}`,
  })

export const deletePrometheusServiceMonitor = createContextUpdater(prometheusServiceMonitorsDataKey,
  async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const sm = currentItems.find(propEq('uid', id))
    if (!sm) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusServiceMonitor(sm.clusterUuid, sm.namespace, sm.name)
  }, {
    uniqueIdentifier: 'metadata.uid',
    operation: 'delete',
    successMessage: (updatedItems, prevItems,
      { id }) => `Successfully deleted Prometheus service monitor ${pipe(
      find(propEq('uid', id)),
      prop('name'),
    )(prevItems)}`,
    errorMessage: (catchedErr, { id }) => switchCase(
      `Error when trying to delete Prometheus service monitor with id: ${id}`,
      [notFoundErr, `Unable to find prometheus service monitor with id: ${id} in deletePrometheusServiceMonitor`],
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

export const loadPrometheusAlertManagers = createContextLoader(prometheusAlertManagersDataKey,
  async (params, loadFromContext) => {
    const { qbert } = ApiClient.getInstance()
    const clusterTags = await loadFromContext(clusterTagsDataKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasMonitoring))
    return asyncFlatMap(clusterUuids, qbert.getPrometheusAlertManagers)
  }, {
    uniqueIdentifier: 'metadata.uid',
    dataMapper: map(mapAlertManager),
  })

/**
 * @type contextUpdaterFn
 */
export const updatePrometheusAlertManager = createContextUpdater(prometheusAlertManagersDataKey,
  async data => {
    const { qbert } = ApiClient.getInstance()
    return qbert.updatePrometheusAlertManager(data)
  }, {
    uniqueIdentifier: 'metadata.uid',
    operation: 'update',
    successMessage: (updatedItems, prevItems,
      { id }) => `Successfully updated Prometheus Alert Manager ${pipe(
      find(propEq('uid', id)),
      prop('name'),
    )(updatedItems)}`,
  })

export const deletePrometheusAlertManager = createContextUpdater(prometheusAlertManagersDataKey,
  async ({ id }, currentItems) => {
    const { qbert } = ApiClient.getInstance()
    const am = currentItems.find(propEq('uid', id))
    if (!am) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusAlertManager(am.clusterUuid, am.namespace, am.name)
  }, {
    entityName: 'Prometheus Alert Manager',
    uniqueIdentifier: 'metadata.uid',
    operation: 'delete',
    successMessage: (updatedItems, prevItems,
      { id }) => `Successfully deleted Prometheus Alert Manager ${pipe(
      find(propEq('uid', id)),
      prop('name'),
    )(prevItems)}`,
    errorMessage: (catchedErr, { id }) => switchCase(
      `Error when trying to delete Prometheus Alert Manager with id: ${id}`,
      [notFoundErr, `Unable to find prometheus Alert Manager with id: ${id} in deletePrometheusAlertManager`],
    )(catchedErr.message),
  })
