import { createSelector } from 'reselect'
import { pathOr, path, pipe, find, propEq, prop, mergeLeft } from 'ramda'
import { emptyArr, pathStr } from 'utils/fp'
import moment from 'moment'
import { cacheStoreKey, dataStoreKey } from 'core/caching/cacheReducers'
import { alertsCacheKey, alertsTimeSeriesCacheKey } from 'k8s/components/alarms/actions'
import { clustersSelector } from 'k8s/components/infrastructure/clusters/selectors'

const getQbertUrl = (qbertEndpoint) => {
  // Trim the uri after "/qbert" from the qbert endpoint
  return qbertEndpoint.match(/(.*?)\/qbert/)[1]
}

export const alertsSelector = createSelector(
  [
    pathOr(emptyArr, [cacheStoreKey, dataStoreKey, alertsCacheKey]),
    clustersSelector,
    pathOr(emptyArr, ['qbert', 'endpoint']),
  ],
  (alerts, clusters, qbertEndpoint) => {
    const qbertPath = getQbertUrl(qbertEndpoint)
    return alerts.map((alert) => ({
      ...alert,
      severity: pathStr('labels.severity', alert),
      summary: pathStr('annotations.message', alert),
      activeAt: path(['alerts', 0, 'activeAt'], alert),
      status: alert.alerts.length ? 'Active' : 'Closed',
      clusterName: pipe(find(propEq('uuid', alert.clusterId)), prop('name'))(clusters),
      grafanaLink:
        `${qbertPath}/k8s/v1/clusters/${alert.clusterId}/k8sapi/api/v1/namespaces` +
        `/pf9-monitoring/services/http:grafana-ui:80/proxy/`,
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
      pathOr(emptyArr, [cacheStoreKey, dataStoreKey, alertsTimeSeriesCacheKey]),
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
      .fill()
      .map(() => momentObj.add(...momentArgs).unix()),
  ]
}

const getSeverityCounts = (alertData, timestamps) => {
  // Use timestamps to create starting template bc not certain if
  // alertData results will contain all timestamps
  const startingTemplate = timestamps.reduce((accum, current) => {
    accum[current] = {
      warning: 0,
      critical: 0,
      fatal: 0,
    }
    return accum
  }, {})

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
