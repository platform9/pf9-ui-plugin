import Bugsnag from '@bugsnag/js'
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
import { trackEvent } from 'utils/tracking'
import { hasPrometheusEnabled } from './helpers'

const { qbert } = ApiClient.getInstance()
const uniqueIdentifier = 'metadata.uid'

const getName = (id, items) => pipe(find(propEq('uid', id)), prop('name'))(items)

/* Prometheus Instances */

export const prometheusInstanceActions = createCRUDActions(ActionDataKeys.PrometheusInstances, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get prometheus instances')
    const clusterTags = await clusterTagActions.list()
    const clusterUuids = pluck('uuid', clusterTags.filter(hasPrometheusEnabled))
    return someAsync(clusterUuids.map(qbert.getPrometheusInstances)).then(flatten)
  },
  createFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to create new prometheus instance', data)
    const result = await qbert.createPrometheusInstance(data.cluster, data)
    trackEvent('Create Prometheus Instance', { cluster: data.cluster })
    return result
  },
  deleteFn: async ({ uid }, currentItems) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete prometheus instance', { uid })
    const instance = currentItems.find(pathEq(['metadata', 'uid'], uid))
    if (!instance) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusInstance(instance.clusterUuid, instance.namespace, instance.name)
    trackEvent('Delete Prometheus Instance ', {
      clusterId: instance.clusterUuid,
      namespace: instance.namespace,
      name: instance.name,
    })
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
    Bugsnag.leaveBreadcrumb('Attempting to get service accounts', {
      clusterId: params.clusterId,
      namespace: params.namespace,
    })
    return qbert.getServiceAccounts(params.clusterId, params.namespace)
  },
  selector: serviceAccountSelector,
  indexBy: ['clusterId', 'namespace'],
  uniqueIdentifier,
})

/* Rules */

export const prometheusRuleActions = createCRUDActions(ActionDataKeys.PrometheusRules, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get Prometheus rule actions')
    const clusterTags = await clusterTagActions.list()
    const clusterUuids = pluck('uuid', clusterTags.filter(hasPrometheusEnabled))
    return someAsync(clusterUuids.map(qbert.getPrometheusRules)).then(flatten)
  },
  updateFn: async (data) => {
    Bugsnag.leaveBreadcrumb('Attempting to get update Prometheus rules', data)
    const result = await qbert.updatePrometheusRules(data)
    trackEvent('Update Prometheus Rule', data)
    return result
  },
  deleteFn: async ({ id }, currentItems) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete Prometheus rule', { id })
    const rule = currentItems.find(propEq('uid', id))
    if (!rule) {
      throw new Error(notFoundErr)
    }
    await qbert.deletePrometheusRule(rule.clusterUuid, rule.namespace, rule.name)
    trackEvent('Delete Prometheus Rule', { id })
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
      Bugsnag.leaveBreadcrumb('Attempting to get Prometheus service monitors')
      const clusterTags = await clusterTagActions.list()
      const clusterUuids = pluck('uuid', clusterTags.filter(hasPrometheusEnabled))
      return someAsync(clusterUuids.map(qbert.getPrometheusServiceMonitors)).then(flatten)
    },
    updateFn: async (data) => {
      Bugsnag.leaveBreadcrumb('Attempting to update Prometheus service monitor', data)
      const result = await qbert.updatePrometheusServiceMonitor(data)
      trackEvent('Update Prometheus Service Monitor', data)
      return result
    },
    deleteFn: async ({ id }, currentItems) => {
      Bugsnag.leaveBreadcrumb('Attempting to delete Prometheus service monitor', { id })
      const sm = currentItems.find(propEq('uid', id))
      if (!sm) {
        throw new Error(notFoundErr)
      }
      await qbert.deletePrometheusServiceMonitor(sm.clusterUuid, sm.namespace, sm.name)
      trackEvent('Delete Prometheus Service Monitor', { id })
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
      Bugsnag.leaveBreadcrumb('Attempting to get Prometheus alert managers')
      const clusterTags = await clusterTagActions.list()
      const clusterUuids = pluck('uuid', clusterTags.filter(hasPrometheusEnabled))
      return someAsync(clusterUuids.map(qbert.getPrometheusAlertManagers)).then(flatten)
    },
    updateFn: async (data) => {
      Bugsnag.leaveBreadcrumb('Attemptingt to update Prometheus alert manager', data)
      const result = await qbert.updatePrometheusAlertManager(data)
      trackEvent('Update Prometheus Alert Mananger', data)
      return result
    },
    deleteFn: async ({ id }, currentItems) => {
      const am = currentItems.find(propEq('uid', id))
      if (!am) {
        throw new Error(notFoundErr)
      }
      const { clusterUuid, namespace, name } = am
      Bugsnag.leaveBreadcrumb('Attempting to delete Prometheus alert mananger', {
        clusterUuid,
        namespace,
        name,
      })
      await qbert.deletePrometheusAlertManager(clusterUuid, namespace, name)
      trackEvent('Delete Prometheus Alert Manager', { clusterUuid, namespace, name })
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
