import { createSelector } from 'reselect'
import { equals, find, flatten, mergeLeft, pathOr, pipe, prop, propEq } from 'ramda'
import { emptyArr, filterIf, pathStr } from 'utils/fp'
import moment from 'moment'
import { cacheStoreKey, dataStoreKey } from 'core/caching/cacheReducers'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'
import {
  IAlert,
  IAlertOverTime,
  IAlertOverTimeSelector,
  IAlertSelector,
  ISeverityCount,
} from './model'
import { IClusterAction } from '../infrastructure/clusters/model'
import { IDataKeys } from 'k8s/datakeys.model'
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
      severity: alert?.labels?.severity, // pathStr('labels.severity', alert)
      summary: alert?.annotations?.message, // pathStr('annotations.message', alert),
      activeAt: alert?.alerts?.[0]?.activeAt, // path(['alerts', 0, 'activeAt'], alert),
      status: alert.alerts.length ? 'Active' : 'Closed',
      clusterName: pipe(
        find<IClusterAction>(propEq('uuid', alert.clusterId)),
        prop('name'),
      )(clusters),
      for: flattenedRules.find((rule) => {
        return (
          equals(rule.alert, alert.name) &&
          equals(pathStr('labels.severity', rule), pathStr('labels.severity', alert)) &&
          equals(rule.clusterUuid, alert.clusterId)
        )
      }).for,
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
  return createSelector<IDataKeys, IAlertOverTime[], any, IAlertOverTimeSelector[]>(
    [
      (state) => pathOr(emptyArr, [cacheStoreKey, dataStoreKey, DataKeys.AlertsTimeSeries])(state),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (timeSeriesRaw, params) => {
      const { chartTime } = params
      const timeNow = moment().unix()
      const [number, period] = chartTime.split('.')
      const timePast = moment
        .unix(timeNow)
        .subtract(number, period)
        .unix()

      // Still need to calculate this manually as well because there
      // is a chance that if no alerts were firing during that time,
      // the API will not return those timestamps.
      // Use unix timestamp to match the prometheus API
      const timestamps = getTimestamps(timePast, chartTime)

      const severityCounts = getSeverityCounts(timeSeriesRaw, timestamps)
      return timestamps.map((timestamp) => ({
        timestamp,
        time: moment.unix(timestamp).format('h:mm A'),
        ...severityCounts[timestamp],
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
    for (const dataPoint of current.values) {
      if (dataPoint[1] === '1') {
        accum[dataPoint[0]][severity] += 1
      }
    }
    return accum
  }, startingTemplate)

  return severityCountsByTimestamp
}
