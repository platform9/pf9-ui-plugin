import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { pluck, flatten } from 'ramda'
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
      return someAsync(pluck('uuid', clusters).map(qbert.getPrometheusAlerts)).then(flatten)
    }

    return await qbert.getPrometheusAlerts(clusterId)
  },
  {
    dataMapper: async (items, params, loadFromContext) => {
      return items.map((item) => ({
        ...item,
        id: pathStr('labels.alertname', item),
        name: pathStr('labels.alertname', item),
        severity: pathStr('labels.severity', item),
        summary: pathStr('annotations.message', item),
      }))
    },
    entityName: 'Alert',
    uniqueIdentifier: 'labels.alertname',
    indexBy: 'clusterId',
  },
)

export const loadTimeSeriesAlerts = createContextLoader(
  alertsTimeSeriesCacheKey,
  async ({ clusterId }) => {
    const timeNow = moment().unix()
    const timePast = moment().subtract(1, 'days').unix()
    const step = '1h'
    return qbert.getPrometheusAlertsOverTime(clusterId, timePast, timeNow, step)
  },
  {
    entityName: 'AlertTimeSeries',
    uniqueIdentifier: 'metric.alertname',
    indexBy: 'clusterId',
  },
)
