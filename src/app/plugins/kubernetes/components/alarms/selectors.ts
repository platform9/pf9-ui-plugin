import { createSelector } from 'reselect'
import { equals, find, flatten, mergeLeft, pathOr, pipe, prop, propEq } from 'ramda'
import { filterIf, pathStr } from 'utils/fp'
import moment from 'moment'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'
import { IAlert, IAlertOverTime, IAlertSelector, ISeverityCount } from './model'
import { IClusterAction } from '../infrastructure/clusters/model'
import { clientStoreKey } from 'core/client/clientReducers'
import getDataSelector from 'core/utils/getDataSelector'
import createSorter from 'core/helpers/createSorter'
import { prometheusRuleSelector } from 'k8s/components/prometheus/selectors'

const getQbertUrl = (qbertEndpoint) => {
  // Trim the uri after "/qbert" from the qbert endpoint
  return `${qbertEndpoint.match(/(.*?)\/qbert/)[1]}/k8s/v1/clusters/`
}

const getGrafanaUrl = (baseUrl: string) => ({ clusterId }: IAlert) =>
  `${baseUrl}${clusterId}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`

// Used to calculate the timestamps on the chart
// Each period (represented by key name) is split into
// 6 equal intervals (represented by the value)
// h is hours, m is minutes
const timestampSteps = {
  // for use in moment.add
  '24.h': [4, 'h'],
  '12.h': [2, 'h'],
  '6.h': [1, 'h'],
  '3.h': [30, 'm'],
  '1.h': [10, 'm'],
}

// TODO replace IDataKeys with an actual whole store state model
// TODO replace IClusterAction typings with cluster selector return types.
export const alertsSelector = createSelector(
  [
    getDataSelector(DataKeys.Alerts, ['clusterId']),
    clustersSelector,
    prometheusRuleSelector,
    pathOr('', [clientStoreKey, 'endpoints', 'qbert']),
  ],
  (rawAlerts, clusters, prometheusRules, qbertEndpoint) => {
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
    return rawAlerts.map((alert) => ({
      ...alert,
      name: alert?.labels.alertname, // pathStr('labels.alertname', alert)
      severity: alert?.labels?.severity, // pathStr('labels.severity', alert)
      summary: alert?.annotations?.message, // pathStr('annotations.message', alert),
      status: alert?.state === 'firing' ? 'Active' : 'Closed',
      exportedNamespace: alert?.labels?.exported_namespace,
      clusterName: pipe(
        find<IClusterAction>(propEq('uuid', alert.clusterId)),
        prop('name'),
      )(clusters),
      for: flattenedRules.find((rule) => {
        return (
          equals(rule.alert, pathStr('labels.alertname', alert)) &&
          equals(pathStr('labels.severity', rule), pathStr('labels.severity', alert)) &&
          equals(rule.clusterUuid, alert.clusterId)
        )
      }),
      grafanaLink: grafanaUrlBuilder(alert),
    }))
  },
)
export const makeAlertsSelector = (
  defaultParams = {
    orderBy: 'activeAt',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [alertsSelector, (_, params) => mergeLeft(params, defaultParams)],
    (alerts, params) => {
      const { showNeverActive, orderBy, orderDirection } = params
      return pipe<IAlertSelector[], IAlertSelector[], IAlertSelector[]>(
        filterIf(showNeverActive, (alert) => alert.activeAt),
        createSorter({ orderBy, orderDirection }),
      )(alerts)
    },
  )
}

// TODO typings for params
export const makeTimeSeriesSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [
      getDataSelector<DataKeys.AlertsTimeSeries>(DataKeys.AlertsTimeSeries, [
        'clusterId',
        'chartTime',
      ]),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (timeSeriesRaw = [], params) => {
      // Still need to calculate this manually as well because there
      // is a chance that if no alerts were firing during that time,
      // the API will not return those timestamps.
      // Use unix timestamp to match the prometheus API
      // const timestamps = getTimestamps()

      const { startTime } = timeSeriesRaw?.[0] || {}
      const timestamps = getTimestamps(startTime, params.chartTime)

      const severityCounts = getSeverityCounts(timeSeriesRaw, timestamps)
      return Object.entries(severityCounts).map(([timestamp, counts]) => ({
        timestamp: parseInt(timestamp),
        time: moment.unix(parseInt(timestamp)).format('h:mm A'),
        ...counts,
      }))
    },
  )
}

// Maybe in the future we can add interval variable and make the
// period & intervals dynamic, but for now just use preset periods
// and 6 intervals (represented by 7 timestamps).
// Example result passing in startTime = 1583458852 and period = '12.h':
// [1583458852, 1583466052, 1583473252, 1583480452, 1583487652, 1583494852, 1583502052]
// Gives unix timestamps for startTime and for every 2 hours until 12 hours
const getTimestamps = (startTime, period) => {
  if (!startTime || !period) return []
  const momentObj = moment.unix(startTime)
  const momentArgs = timestampSteps[period]
  return [
    momentObj.unix(),
    ...Array(6)
      .fill(undefined)
      .map(() => momentObj.add(...momentArgs).unix()),
  ]
}

const getSeverityCounts = (alertData: IAlertOverTime[], timestamps: number[]) => {
  // Use timestamps to create starting template bc not certain if
  // alertData results will contain all timestamps
  const startingTemplate: { [key: number]: ISeverityCount } = timestamps.reduce(
    (accum, current) => {
      accum[current] = {
        warning: 0,
        critical: 0,
        fatal: 0,
      }
      return accum
    },
    {},
  )

  // Strip out warning, critical, and fatal alerts for chart
  const importantAlerts = alertData.filter((alert) =>
    ['warning', 'critical', 'fatal'].includes(alert.metric.severity),
  )

  // Add count to template
  const severityCountsByTimestamp = importantAlerts.reduce((accum, current) => {
    const severity = current.metric.severity
    for (const [timestamp, value] of current.values) {
      if (value === '1') {
        accum[timestamp] = accum[timestamp] || {
          warning: 0,
          critical: 0,
          fatal: 0,
        }
        accum[timestamp][severity] += 1
      }
    }
    return accum
  }, startingTemplate)

  return severityCountsByTimestamp
}
