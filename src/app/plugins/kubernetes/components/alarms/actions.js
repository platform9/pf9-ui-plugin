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

const composeGrafanaLink = async (clusterId) => {
  const qbertEndpoint = await qbert.baseUrl()
  const host = qbertEndpoint.match(/(.*?)\/qbert/)[1]
  return `${host}/k8s/v1/clusters/${clusterId}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`
}

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
        grafanaLink: composeGrafanaLink(item.clusterId),
      }))
    },
    entityName: 'Alert',
    uniqueIdentifier: 'id',
    indexBy: 'clusterId',
  },
)

const timestampSteps = {
  // for use in moment.add
  '24.h': [4, 'h'],
  '12.h': [2, 'h'],
  '6.h': [1, 'h'],
  '3.h': [30, 'm'],
  '1.h': [10, 'm'],
}

// Maybe in the future we can add interval variable and make the
// period & intervals dynamic, but for now just use preset periods
// and 7 intervals.
const getTimestamps = (startTime, period) => {
  const momentObj = moment.unix(startTime)
  const momentArgs = timestampSteps[period]
  return [momentObj.unix(), ...Array(6).fill().map(() => momentObj.add(...momentArgs).unix())]
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
    // Invalidate cache -- can't get cache working properly for this
    // collection. Collection is somewhat different from all other
    // types of collections.
    loadTimeSeriesAlerts.invalidateCache()

    const timeNow = moment().unix()
    const [number, period] = chartTime.split('.')
    const timePast = moment.unix(timeNow).subtract(number, period).unix()
    const step = timestampSteps[chartTime].join('')

    // Still need to calculate this manually as well because there
    // is a chance that if no alerts were firing during that time,
    // the API will not return those timestamps.
    // Use unix timestamp to match the prometheus API
    const timestamps = getTimestamps(timePast, chartTime)

    const clusters = await loadFromContext(clustersCacheKey, { prometheusClusters: true })
    if (chartClusterId === allKey) {
      const all = await someAsync(pluck('uuid', clusters).map((cluster) => (
        qbert.getPrometheusAlertsOverTime(cluster, timePast, timeNow, step)
      ))).then(flatten)
      const severityCounts = getSeverityCounts(all, timestamps)
      return timestamps.map((timestamp) => (
        {
          time: moment.unix(timestamp).format('h:mm A'),
          ...severityCounts[timestamp],
        }
      ))
    }

    const response = await qbert.getPrometheusAlertsOverTime(chartClusterId, timePast, timeNow, step)
    const severityCounts = getSeverityCounts(response, timestamps)
    return timestamps.map((timestamp) => (
      {
        timestamp,
        time: moment.unix(timestamp).format('h:mm A'),
        ...severityCounts[timestamp],
      }
    ))
  },
  {
    entityName: 'AlertTimeSeries',
    // make uniqueIdentifier timestamp bc of autosort
    // not sure if this has to do with the reason why the
    // cache does not work properly
    uniqueIdentifier: 'timestamp',
    // Have to add clusterId and severity here too to trigger the invalidate cache
    indexBy: ['chartClusterId', 'chartTime', 'clusterId', 'severity'],
  },
)
