import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { propEq, pluck, pipe, find, prop, flatten } from 'ramda'
import { someAsync } from 'utils/async'
import { clustersCacheKey } from '../infrastructure/common/actions'
import moment from 'moment'
import { pathStr } from 'utils/fp'
import { allKey } from 'app/constants'

const { qbert } = ApiClient.getInstance()

export const alertsCacheKey = 'alerts'
export const alertsTimeSeriesCacheKey = 'alertsTimeSeries'

export const loadAlerts = createContextLoader(
  alertsCacheKey,
  async ({ clusterId }, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    if (clusterId === allKey) {
      const all = await someAsync(pluck('uuid', clusters).map(qbert.getPrometheusAlerts)).then(flatten)
      return all
    }

    return await qbert.getPrometheusAlerts(clusterId)
  },
  {
    dataMapper: async (items, params, loadFromContext) => {
      const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
      return items.map((item) => ({
        ...item,
        name: pathStr('labels.alertname', item),
        severity: pathStr('labels.severity', item),
        summary: pathStr('annotations.message', item),
        clusterName: pipe(find(propEq('uuid', item.clusterId)), prop('name'))(clusters),
      }))
    },
    entityName: 'Alert',
    uniqueIdentifier: 'id',
    indexBy: 'clusterId',
  },
)

// Maybe in the future we can add interval variable and make the
// period & intervals dynamic, but for now just preset periods
// and 7 intervals.
const getTimestamps = (startTime, period) => {
  const momentObj = moment.unix(startTime)

  if (period === '24.h') {
    return [
      momentObj.unix(),
      momentObj.add(4, 'hours').unix(),
      momentObj.add(4, 'hours').unix(),
      momentObj.add(4, 'hours').unix(),
      momentObj.add(4, 'hours').unix(),
      momentObj.add(4, 'hours').unix(),
      momentObj.add(4, 'hours').unix(),
    ]
  } else if (period === '12.h') {
    return [
      momentObj.unix(),
      momentObj.add(2, 'hours').unix(),
      momentObj.add(2, 'hours').unix(),
      momentObj.add(2, 'hours').unix(),
      momentObj.add(2, 'hours').unix(),
      momentObj.add(2, 'hours').unix(),
      momentObj.add(2, 'hours').unix(),
    ]
  } else if (period === '6.h') {
    return [
      momentObj.unix(),
      momentObj.add(1, 'hours').unix(),
      momentObj.add(1, 'hours').unix(),
      momentObj.add(1, 'hours').unix(),
      momentObj.add(1, 'hours').unix(),
      momentObj.add(1, 'hours').unix(),
      momentObj.add(1, 'hours').unix(),
    ]
  } else if (period === '3.h') {
    return [
      momentObj.unix(),
      momentObj.add(30, 'minutes').unix(),
      momentObj.add(30, 'minutes').unix(),
      momentObj.add(30, 'minutes').unix(),
      momentObj.add(30, 'minutes').unix(),
      momentObj.add(30, 'minutes').unix(),
      momentObj.add(30, 'minutes').unix(),
    ]
  } else if (period === '1.h') {
    return [
      momentObj.unix(),
      momentObj.add(10, 'minutes').unix(),
      momentObj.add(10, 'minutes').unix(),
      momentObj.add(10, 'minutes').unix(),
      momentObj.add(10, 'minutes').unix(),
      momentObj.add(10, 'minutes').unix(),
      momentObj.add(10, 'minutes').unix(),
    ]
  }
}

const stepTime = {
  '24.h': '4h',
  '12.h': '2h',
  '6.h': '1h',
  '3.h': '30m',
  '1.h': '10m',
}

const getSeverityCounts = (alertData, timestamps) => {
  const startingTemplate = timestamps.reduce((accum, current) => {
    accum[current] = {
      warning: 0,
      critical: 0,
      fatal: 0,
    }
    return accum
  }, {})

  const severityCountsByTimestamp = alertData.reduce((accum, current) => {
    const severity = current.metric.severity
    if (['warning', 'critical', 'fatal'].includes(severity)) {
      for (const dataPoint of current.values) {
        if (dataPoint[1] === '1') {
          accum[dataPoint[0]][severity] += 1
        }
      }
    }
    return accum
  }, startingTemplate)

  return severityCountsByTimestamp
}

export const loadTimeSeriesAlerts = createContextLoader(
  alertsTimeSeriesCacheKey,
  async ({ chartClusterId, chartTime }, loadFromContext) => {
    const timeNow = moment().unix()
    const [number, period] = chartTime.split('.')
    const timePast = moment().subtract(number, period).unix()
    const step = stepTime[chartTime]

    // Still need to calculate this manually as well because there
    // is a chance that if no alerts were firing during that time,
    // the API will not return those timestamps.
    // Use unix timestamp to match the prometheus API
    const timestamps = getTimestamps(timePast, chartTime)

    const clusters = await loadFromContext(clustersCacheKey, { healthyClusters: true })
    if (chartClusterId === allKey) {
      const all = await someAsync(pluck('uuid', clusters).map((cluster) => {
        console.log(cluster)
        return qbert.getPrometheusAlertsOverTime(cluster, timePast, timeNow, step)
      })).then(flatten)
      const severityCounts = getSeverityCounts(all, timestamps)
      return timestamps.map((timestamp) => (
        {
          time: moment.unix(timestamp).format('h:mm A'),
          ...severityCounts[timestamp]
        }
      ))
    }

    const response = await qbert.getPrometheusAlertsOverTime(chartClusterId, timePast, timeNow, step)
    const severityCounts = getSeverityCounts(response, timestamps)
    return timestamps.map((timestamp) => (
      {
        timestamp,
        time: moment.unix(timestamp).format('h:mm A'),
        ...severityCounts[timestamp]
      }
    ))
  },
  {
    entityName: 'AlertTimeSeries',
    // uniqueIdentifier must be timestamp bc of autosort
    uniqueIdentifier: 'timestamp',
    indexBy: ['chartClusterId', 'chartTime'],
  },
)
