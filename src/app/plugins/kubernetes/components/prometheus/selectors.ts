import { createSelector } from 'reselect'
import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { find, pathOr, pipe, prop } from 'ramda'
import { pathStrOrNull } from 'utils/fp'
import { IClusterAction } from 'k8s/components/infrastructure/clusters/model'

console.log('clustersSelector', clustersSelector)
export const prometheusSelector = createSelector(
  [getDataSelector<DataKeys.PrometheusInstances>(DataKeys.PrometheusInstances), clustersSelector],
  (rawDeployments, clusters) => {
    return rawDeployments.map(({ clusterId, metadata, spec }) => ({
      clusterUuid: clusterId,
      clusterName: pipe<IClusterAction[], IClusterAction, string>(
        find((cluster) => cluster.uuid === clusterId),
        prop('name'),
      )(clusters),
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
  },
)

export const serviceAccountSelector = createSelector(
  [getDataSelector<DataKeys.ServiceAccounts>(DataKeys.ServiceAccounts), clustersSelector],
  (rawServiceAccountActions, clusters) => {
    return rawServiceAccountActions.map(({ clusterId, metadata, spec }) => ({
      uid: metadata.uid,
      clusterUuid: clusterId,
      clusterName: pipe<IClusterAction[], IClusterAction, string>(
        find((cluster) => cluster.uuid === clusterId),
        prop('name'),
      )(clusters),
      name: metadata.name,
      namespace: metadata.namespace,
      labels: metadata.labels,
    }))
  },
)

export const prometheusRuleSelector = createSelector(
  [getDataSelector<DataKeys.PrometheusRules>(DataKeys.PrometheusRules), clustersSelector],
  (rawPrometheusRules, clusters) => {
    return rawPrometheusRules.map(({ clusterId, metadata, spec }) => ({
      uid: metadata.uid,
      clusterUuid: clusterId,
      clusterName: pipe<IClusterAction[], IClusterAction, string>(
        find((cluster) => cluster.uuid === clusterId),
        prop('name'),
      )(clusters),
      name: metadata.name,
      namespace: metadata.namespace,
      labels: metadata.labels,
      rules: pathOr([], ['groups'], spec),
    }))
  },
)

export const prometheusServiceMonitorSelector = createSelector(
  [
    getDataSelector<DataKeys.PrometheusServiceMonitors>(DataKeys.PrometheusServiceMonitors),
    clustersSelector,
  ],
  (rawPrometheusServiceMonitors, clusters) => {
    return rawPrometheusServiceMonitors.map(({ clusterId, metadata, spec }) => ({
      uid: metadata.uid,
      clusterUuid: clusterId,
      clusterName: pipe<IClusterAction[], IClusterAction, string>(
        find((cluster) => cluster.uuid === clusterId),
        prop('name'),
      )(clusters),
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
    }))
  },
)

export const prometheusAlertManagersSelector = createSelector(
  [
    getDataSelector<DataKeys.PrometheusAlertManagers>(DataKeys.PrometheusAlertManagers),
    clustersSelector,
  ],
  (rawPrometheusAlertManagers, clusters) => {
    return rawPrometheusAlertManagers.map(({ clusterId, metadata, spec }) => ({
      uid: metadata.uid,
      clusterUuid: clusterId,
      clusterName: pipe<IClusterAction[], IClusterAction, string>(
        find((cluster) => cluster.uuid === clusterId),
        prop('name'),
      )(clusters),
      name: metadata.name,
      namespace: metadata.namespace,
      replicas: spec.replicas,
      labels: metadata.labels,
    }))
  },
)
