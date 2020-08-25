import ApiClient from 'api-client/ApiClient'
import { notFoundErr } from 'app/constants'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { clusterTagActions } from 'k8s/components/infrastructure/clusters/actions'
import {
  prometheusAlertManagersSelector,
  prometheusRuleSelector,
  prometheusSelector,
  prometheusServiceMonitorSelector,
  serviceAccountSelector,
} from 'k8s/components/prometheus/selectors'
import { ActionDataKeys } from 'k8s/DataKeys'
import { find, flatten, last, pathEq, pipe, pluck, prop, propEq } from 'ramda'
import { someAsync } from 'utils/async'
import { objSwitchCase } from 'utils/fp'

const { qbert } = ApiClient.getInstance()
const uniqueIdentifier = 'metadata.uid'
const monitoringTask = 'pf9-mon'
const getName = (id, items) => pipe(find(propEq('uid', id)), prop('name'))(items)

const isMonitoringTask = (task = {}) => task.pkg_id === monitoringTask && task.type === 'Install'
const getMostRecentTask = (prev, curr) => (prev.task_id > curr.task_id ? prev : curr)
const hasPrometheusEnabled = (cluster) => {
  if (!cluster) return false
  const installedMonitoringTask = (cluster.tasks || [])
    .filter(isMonitoringTask)
    .reduce(getMostRecentTask, {})

  return installedMonitoringTask.status === 'Complete'
}

/* Prometheus Instances */

export const prometheusInstanceActions = createCRUDActions(ActionDataKeys.PrometheusInstances, {
  listFn: async () => {
    const clusterTags = await clusterTagActions.list()
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
  selector: prometheusSelector,
  successMessage: (updatedItems, prevItems, { uid }, operation) =>
    objSwitchCase({
      create: `Successfully created Prometheus instance ${prop('name', last(updatedItems))}`,
      delete: `Successfully deleted Prometheus instance ${getName(uid, prevItems)}`,
    })(operation),
  uniqueIdentifier,
})

/* Service Accounts */

export const serviceAccountActions = createCRUDActions(ActionDataKeys.ServiceAccounts, {
  listFn: async (params) => {
    return qbert.getServiceAccounts(params.clusterId, params.namespace)
  },
  selector: serviceAccountSelector,
  indexBy: ['clusterId', 'namespace'],
  uniqueIdentifier,
})

/* Rules */

export const prometheusRuleActions = createCRUDActions(ActionDataKeys.PrometheusRules, {
  listFn: async () => {
    const clusterTags = await clusterTagActions.list()
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
  selector: prometheusRuleSelector,
  uniqueIdentifier,
})

/* Service Monitors */
export const prometheusServiceMonitorActions = createCRUDActions(
  ActionDataKeys.PrometheusServiceMonitors,
  {
    listFn: async () => {
      const clusterTags = await clusterTagActions.list()
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
    selector: prometheusServiceMonitorSelector,
    uniqueIdentifier,
  },
)

/* Alert Managers */

export const prometheusAlertManagerActions = createCRUDActions(
  ActionDataKeys.PrometheusAlertManagers,
  {
    listFn: async () => {
      const clusterTags = await clusterTagActions.list()
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
    selector: prometheusAlertManagersSelector,
    uniqueIdentifier,
  },
)
