import { createSelector } from 'reselect'
import { equals, find, flatten, mergeLeft, pathOr, pipe, prop, propEq } from 'ramda'
import { pathStr } from 'utils/fp'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'
import { IAlertRule, IAlertRuleSelector } from './model'
import { IClusterAction } from '../infrastructure/clusters/model'
import { clientStoreKey } from 'core/client/clientReducers'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'
import { prometheusRuleSelector } from 'k8s/components/prometheus/selectors'

const getQbertUrl = (qbertEndpoint) => {
  // Trim the uri after "/qbert" from the qbert endpoint
  return `${qbertEndpoint.match(/(.*?)\/qbert/)[1]}/k8s/v1/clusters/`
}

const getGrafanaUrl = (baseUrl: string) => ({ clusterId }: IAlertRule) =>
  `${baseUrl}${clusterId}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`

// TODO replace IDataKeys with an actual whole store state model
// TODO replace IClusterAction typings with cluster selector return types.
export const alertRulesSelector = createSelector(
  [
    getDataSelector(DataKeys.AlertRules, ['clusterId']),
    clustersSelector,
    prometheusRuleSelector,
    pathOr('', [clientStoreKey, 'endpoints', 'qbert']),
  ],
  (rawAlertRules, clusters, prometheusRules, qbertEndpoint) => {
    const grafanaUrlBuilder = getGrafanaUrl(getQbertUrl(qbertEndpoint))
    // Need to dig into the coreos prometheus rules to fetch the 'for' property
    const flattenedRules = flatten(
      prometheusRules.map((cluster) =>
        flatten(
          cluster.rules.map((rules) =>
            rules.rules.map((rule) => ({
              ...rule,
              clusterUuid: cluster.clusterUuid,
            })),
          ),
        ),
      ),
    )

    return rawAlertRules.map((alertRule) => ({
      ...alertRule,
      severity: alertRule.labels?.severity,
      summary: alertRule.annotations?.message || alertRule.annotations?.summary,
      description: alertRule.annotations?.description,
      clusterName: pipe(
        find<IClusterAction>(propEq('uuid', alertRule.clusterId)),
        prop('name'),
      )(clusters),
      for: flattenedRules.find((rule) => {
        return (
          equals(alertRule.name, rule.alert) &&
          equals(pathStr('labels.severity', alertRule), pathStr('labels.severity', rule)) &&
          equals(alertRule.clusterId, rule.clusterUuid)
        )
      })?.for,
      grafanaLink: grafanaUrlBuilder(alertRule),
    }))
  },
)
export const makeAlertRulesSelector = (
  defaultParams = {
    orderBy: 'activeAt',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [alertRulesSelector, (_, params) => mergeLeft(params, defaultParams)],
    (alertRules, params) => {
      const { orderBy, orderDirection } = params
      return pipe<IAlertRuleSelector[], IAlertRuleSelector[]>(
        createSorter({ orderBy, orderDirection }),
      )(alertRules)
    },
  )
}
