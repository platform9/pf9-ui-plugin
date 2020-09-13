import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { path, propEq, pluck, pipe, find, prop, flatten, equals } from 'ramda'
import { someAsync } from 'utils/async'
import { clustersCacheKey } from '../infrastructure/common/actions'
import { prometheusRulesCacheKey } from 'k8s/components/prometheus/actions'
import moment from 'moment'
import { pathStr } from 'utils/fp'
import { allKey } from 'app/constants'
import { capitalizeString } from 'utils/misc'

const { qbert } = ApiClient.getInstance()

export const alertsCacheKey = 'alerts'
export const alertsTimeSeriesCacheKey = 'alertsTimeSeries'

const getQbertEndpoint = async () => {
  const qbertEndpoint = await qbert.baseUrl()
  return qbertEndpoint.match(/(.*?)\/qbert/)[1]
}

export const loadAlerts = createContextLoader(
  alertsCacheKey,
  async ({ clusterId }, loadFromContext) => {
    const clusters = await loadFromContext(clustersCacheKey, {
      healthyClusters: true,
      prometheusClusters: true,
    })
    if (clusterId === allKey) {
      const all = await someAsync(pluck('uuid', clusters).map(qbert.getAlertManagerAlerts)).then(
        flatten,
      )
      return all
    }

    return qbert.getAlertManagerAlerts(clusterId)
  },
  {
    dataMapper: async (items, params, loadFromContext) => {
      const clusters = await loadFromContext(clustersCacheKey, {
        healthyClusters: true,
        prometheusClusters: true,
      })
      const prometheusRules = await loadFromContext(prometheusRulesCacheKey, params)
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
      const host = await getQbertEndpoint()
      const alerts = items.map((item) => ({
        ...item,
        exportedNamespace: pathStr('labels.exported_namespace', item),
        name: pathStr('labels.alertname', item),
        severity: pathStr('labels.severity', item),
        summary: pathStr('annotations.message', item),
        status: capitalizeString(pathStr('status.state', item) || 'N/A'),
        clusterName: pipe(find(propEq('uuid', item.clusterId)), prop('name'))(clusters),
        for: pathStr(
          'for',
          flattenedRules.find((rule) => {
            return (
              equals(rule.alert, item.name) &&
              equals(pathStr('labels.severity', rule), pathStr('labels.severity', item)) &&
              equals(rule.clusterUuid, item.clusterId)
            )
          }),
        ),
        grafanaLink: `${host}/k8s/v1/clusters/${item.clusterId}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`,
      }))
      return params.showNeverActive ? alerts : alerts.filter((alert) => alert.updatedAt)
    },
    defaultOrderBy: 'updatedAt',
    defaultOrderDirection: 'desc',
    entityName: 'Alert',
    uniqueIdentifier: 'id',
    indexBy: 'clusterId',
  },
)

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

export const loadTimeSeriesAlerts = createContextLoader(
  alertsTimeSeriesCacheKey,
  async ({ clusterId, chartTime, severity }, loadFromContext) => {
    // Invalidate cache -- can't get cache working properly for this
    // collection. Collection is somewhat different from all other
    // types of collections.
    loadTimeSeriesAlerts.invalidateCache()

    const timeNow = moment().unix()
    const [number, period] = chartTime.split('.')
    const timePast = moment
      .unix(timeNow)
      .subtract(number, period)
      .unix()
    const step = timestampSteps[chartTime].join('')

    // Still need to calculate this manually as well because there
    // is a chance that if no alerts were firing during that time,
    // the API will not return those timestamps.
    // Use unix timestamp to match the prometheus API
    const timestamps = getTimestamps(timePast, chartTime)

    const clusters = await loadFromContext(clustersCacheKey, {
      healthyClusters: true,
      prometheusClusters: true,
    })
    if (clusterId === allKey) {
      const all = await someAsync(
        pluck('uuid', clusters).map((cluster) =>
          qbert.getPrometheusAlertsOverTime(cluster, timePast, timeNow, step),
        ),
      ).then(flatten)
      const severityCounts = getSeverityCounts(all, timestamps)
      return timestamps.map((timestamp) => ({
        timestamp,
        time: moment.unix(timestamp).format('h:mm A'),
        ...severityCounts[timestamp],
      }))
    }

    const response = await qbert.getPrometheusAlertsOverTime(clusterId, timePast, timeNow, step)
    const severityCounts = getSeverityCounts(response, timestamps)
    return timestamps.map((timestamp) => ({
      timestamp,
      time: moment.unix(timestamp).format('h:mm A'),
      ...severityCounts[timestamp],
    }))
  },
  {
    entityName: 'AlertTimeSeries',
    // make uniqueIdentifier timestamp bc of autosort
    // not sure if this has to do with the reason why the
    // cache does not work properly
    uniqueIdentifier: 'timestamp',
    indexBy: ['clusterId', 'chartTime'],
  },
)
