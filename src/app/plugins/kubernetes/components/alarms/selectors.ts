import { createSelector } from 'reselect'
import { pathOr, path, pipe, find, propEq, prop, mergeLeft } from 'ramda'
import { emptyArr, pathStr } from 'utils/fp'
import moment from 'moment'
import { cacheStoreKey, dataStoreKey } from 'core/caching/cacheReducers'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import DataKeys from 'k8s/DataKeys'
import { IAlert, IAlertOverTime, ISeverityCount } from './model'
import { IClusterAction } from '../infrastructure/clusters/model'

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

// TODO check cluster typings with cluster selector. get generics to work on create selector
// TODO update IClusterAction type with actual cluster type from its selector
export const alertsSelector = createSelector(
  [
    pathOr(emptyArr, [cacheStoreKey, dataStoreKey, DataKeys.Alerts]),
    clustersSelector,
    pathOr('', ['qbert', 'endpoint']),
  ],
  (alerts: IAlert[], clusters, qbertEndpoint: string) => {
    const grafanaUrlBuilder = getGrafanaUrl(getQbertUrl(qbertEndpoint))
    return alerts.map((alert) => ({
      ...alert,
      severity: pathStr('labels.severity', alert),
      summary: pathStr('annotations.message', alert),
      activeAt: path(['alerts', 0, 'activeAt'], alert),
      status: alert.alerts.length ? 'Active' : 'Closed',
      clusterName: pipe(
        find<IClusterAction>(propEq('uuid', alert.clusterId)),
        prop('name'),
      )(clusters),
      grafanaLink: grafanaUrlBuilder(alert),
    }))
  },
)

export const makeTimeSeriesSelector = (
  defaultParams = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [
      pathOr(emptyArr, [cacheStoreKey, dataStoreKey, DataKeys.AlertsTimeSeries]),
      (_, params) => mergeLeft(params, defaultParams),
    ],
    (timeSeriesRaw: IAlertOverTime[], params) => {
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
