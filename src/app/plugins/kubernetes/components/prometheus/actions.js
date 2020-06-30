import { pathStrOrNull, objSwitchCase } from 'utils/fp'
import { map, pathEq, find, pluck, curry, pipe, last, pathOr, prop, propEq, flatten } from 'ramda'
import ApiClient from 'api-client/ApiClient'
import { clustersCacheKey } from '../infrastructure/common/actions'
import { notFoundErr } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { someAsync } from 'utils/async'
import DataKeys from 'k8s/DataKeys'

const { appbert, qbert } = ApiClient.getInstance()
const uniqueIdentifier = 'metadata.uid'
const monitoringTask = 'pf9-mon'
const getName = (id, items) => pipe(find(propEq('uid', id)), prop('name'))(items)

// TODO convert to typescript
// interface IClusterTask {
//   task_id: number
//   type: 'Install' | 'Delete'
//   pkg_id: string
//   cluster: string
//   status: 'Pending' | 'Complete' | 'InProgress' | 'Failed'
// }

const isMonitoringTask = (task = {}) => task.pkg_id === monitoringTask && task.type === 'Install'
const getMostRecentTask = (prev, curr) => (prev.task_id > curr.task_id ? prev : curr)
export const hasPrometheusEnabled = (cluster) => {
  if (!cluster) return false
  const installedMonitoringTask = (cluster.tasks || [])
    .filter(isMonitoringTask)
    .reduce(getMostRecentTask, {})

  return installedMonitoringTask.status === 'Complete'
}
export const clusterTagActions = createCRUDActions(DataKeys.ClusterTags, {
  listFn: async () => {
    return appbert.getClusterTags()
  },
  uniqueIdentifier: 'uuid',
})

/* Prometheus Instances */

export const mapPrometheusInstance = curry((clusters, { clusterId, metadata, spec }) => ({
  clusterUuid: clusterId,
  clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
  name: metadata.name,
  namespace: metadata.namespace,
  uid: metadata.uid,
  serviceMonitorSelector: pathStrOrNull('serviceMonitorSelector.matchLabels', spec),
  alertManagersSelector: pathOr([], ['alerting', 'alertmanagers'], spec)
    .map((x) => x.name)
    .join(', '),
  ruleSelector: pathStrOrNull('ruleSelector.matchLabels', spec),
  cpu: pathStrOrNull('resources.requests.cpu', spec),
  storage: pathStrOrNull('resources.requests.storage', spec),
  memory: pathStrOrNull('resources.requests.memory', spec),
  retention: spec.retention,
  replicas: spec.replicas,
  dashboard: pathOr('', ['annotations', 'service_path'], metadata),
  metadata,
  spec,
}))

export const prometheusInstanceActions = createCRUDActions(DataKeys.PrometheusInstances, {
  listFn: async (params, loadFromContext) => {
    await loadFromContext(clustersCacheKey)
    const clusterTags = await loadFromContext(clusterTagsCacheKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasPrometheusEnabled))
    return someAsync(clusterUuids.map(qbert.getPrometheusInstances)).then(flatten)
  },
  createFn: async (data) => {
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
  successMessage: (updatedItems, prevItems, { uid }, operation) =>
    objSwitchCase({
      create: `Successfully created Prometheus instance ${prop('name', last(updatedItems))}`,
      delete: `Successfully deleted Prometheus instance ${getName(uid, prevItems)}`,
    })(operation),
  uniqueIdentifier,
})

/* Service Accounts */

export const serviceAccountActions = createCRUDActions(DataKeys.ServiceAccounts, {
  listFn: async (params) => {
    return qbert.getServiceAccounts(params.clusterId, params.namespace)
  },
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    return map(({ clusterId, metadata, spec }) => ({
      uid: metadata.uid,
      clusterUuid: clusterId,
      clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
      name: metadata.name,
      namespace: metadata.namespace,
      labels: metadata.labels,
    }))(items)
  },
  indexBy: ['clusterId', 'namespace'],
  uniqueIdentifier,
})

/* Rules */

export const prometheusRuleActions = createCRUDActions(DataKeys.PrometheusRules, {
  listFn: async (params, loadFromContext) => {
    await loadFromContext(clustersCacheKey)
    const clusterTags = await loadFromContext(clusterTagsCacheKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasPrometheusEnabled))
    return someAsync(clusterUuids.map(qbert.getPrometheusRules)).then(flatten)
  },
  updateFn: async (data) => {
    return qbert.updatePrometheusRules(data)
  },
  deleteFn: async ({ id }, currentItems) => {
    const rule = currentItems.find(propEq('uid', id))
    if (!rule) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusRule(rule.clusterUuid, rule.namespace, rule.name)
  },
  successMessage: (updatedItems, prevItems, { uid }, operation) =>
    objSwitchCase({
      create: `Successfully created Prometheus rule ${prop('name', last(updatedItems))}`,
      delete: `Successfully deleted Prometheus rule ${getName(uid, prevItems)}`,
    })(operation),
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    return map(({ clusterId, metadata, spec }) => ({
      uid: metadata.uid,
      clusterUuid: clusterId,
      clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
      name: metadata.name,
      namespace: metadata.namespace,
      labels: metadata.labels,
      rules: pathOr([], ['groups'], spec),
    }))(items)
  },
  uniqueIdentifier,
})

/* Service Monitors */
export const prometheusServiceMonitorActions = createCRUDActions(
  DataKeys.PrometheusServiceMonitors,
  {
    listFn: async (params, loadFromContext) => {
      await loadFromContext(clustersCacheKey)
      const clusterTags = await loadFromContext(clusterTagsCacheKey)
      const clusterUuids = pluck('uuid', clusterTags.filter(hasPrometheusEnabled))
      return someAsync(clusterUuids.map(qbert.getPrometheusServiceMonitors)).then(flatten)
    },
    updateFn: async (data) => {
      return qbert.updatePrometheusServiceMonitor(data)
    },
    deleteFn: async ({ id }, currentItems) => {
      const sm = currentItems.find(propEq('uid', id))
      if (!sm) {
        throw new Error(notFoundErr)
      }
      await qbert.deletePrometheusServiceMonitor(sm.clusterUuid, sm.namespace, sm.name)
    },
    successMessage: (updatedItems, prevItems, { uid }, operation) =>
      objSwitchCase({
        create: `Successfully created Prometheus Service Monitor ${prop(
          'name',
          last(updatedItems),
        )}`,
        delete: `Successfully deleted Prometheus Service Monitor ${getName(uid, prevItems)}`,
      })(operation),
    dataMapper: async (items, params, loadFromContext) => {
      const clusters = await loadFromContext(clustersCacheKey)
      return map(({ clusterId, metadata, spec }) => ({
        uid: metadata.uid,
        clusterUuid: clusterId,
        clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
        name: metadata.name,
        namespace: metadata.namespace,
        labels: metadata.labels,
        port: spec.endpoints.map(prop('port')).join(', '),
        namespaceSelector:
          (spec.namespaceSelector &&
            spec.namespaceSelector.matchNames &&
            spec.namespaceSelector.matchNames.join(', ')) ||
          '-',
        selector: spec.selector,
      }))(items)
    },
    uniqueIdentifier,
  },
)

/* Alert Managers */

export const prometheusAlertManagerActions = createCRUDActions(DataKeys.PrometheusAlertManagers, {
  listFn: async (params, loadFromContext) => {
    await loadFromContext(clustersCacheKey)
    const clusterTags = await loadFromContext(clusterTagsCacheKey)
    const clusterUuids = pluck('uuid', clusterTags.filter(hasPrometheusEnabled))
    return someAsync(clusterUuids.map(qbert.getPrometheusAlertManagers)).then(flatten)
  },
  updateFn: async (data) => {
    return qbert.updatePrometheusAlertManager(data)
  },
  deleteFn: async ({ id }, currentItems) => {
    const am = currentItems.find(propEq('uid', id))
    if (!am) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusAlertManager(am.clusterUuid, am.namespace, am.name)
  },
  successMessage: (updatedItems, prevItems, { uid }, operation) =>
    objSwitchCase({
      create: `Successfully created Prometheus Alert Manager ${prop('name', last(updatedItems))}`,
      delete: `Successfully deleted Prometheus Alert Manager ${getName(uid, prevItems)}`,
    })(operation),
  dataMapper: async (items, params, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey)
    return map(({ clusterId, metadata, spec }) => ({
      uid: metadata.uid,
      clusterUuid: clusterId,
      clusterName: pipe(find(propEq('uuid', clusterId)), prop('name'))(clusters),
      name: metadata.name,
      namespace: metadata.namespace,
      replicas: spec.replicas,
      labels: metadata.labels,
    }))(items)
  },
  uniqueIdentifier,
})
