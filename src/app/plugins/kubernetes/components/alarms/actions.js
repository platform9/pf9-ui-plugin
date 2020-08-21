import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import { pluck, flatten, pipe, filter } from 'ramda'
import { someAsync } from 'utils/async'
import moment from 'moment'
import { allKey } from 'app/constants'
import { alertsSelector, makeTimeSeriesSelector } from 'k8s/components/alarms/selectors'
import { ActionDataKeys } from 'k8s/DataKeys'
import {
  hasPrometheusTag,
  hasHealthyMasterNodes,
} from 'k8s/components/infrastructure/clusters/selectors'

const { qbert } = ApiClient.getInstance()

export const alertsCacheKey = 'alerts'
export const alertsTimeSeriesCacheKey = 'alertsTimeSeries'

export const loadAlerts = createContextLoader(
  ActionDataKeys.Alerts,
  async ({ clusterId }) => {
    return qbert.getPrometheusAlerts(clusterId)
  },
  {
    entityName: 'Alert',
    uniqueIdentifier: 'id',
    indexBy: 'clusterId',
    selector: alertsSelector,
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

export const loadTimeSeriesAlerts = createContextLoader(
  ActionDataKeys.AlertsTimeSeries,
  async ({ clusterId, chartTime }) => {
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

    if (clusterId === allKey) {
      const clusters = pipe(
        filter(hasPrometheusTag),
        filter(hasHealthyMasterNodes),
      )(await qbert.getClusters())

      return someAsync(
        pluck('uuid', clusters).map((cluster) =>
          qbert.getPrometheusAlertsOverTime(cluster, timePast, timeNow, step),
        ),
      ).then(flatten)
    }
    return qbert.getPrometheusAlertsOverTime(clusterId, timePast, timeNow, step)
  },
  {
    entityName: 'AlertTimeSeries',
    // make uniqueIdentifier timestamp bc of autosort
    // not sure if this has to do with the reason why the
    // cache does not work properly
    uniqueIdentifier: 'timestamp',
    selectorCreator: makeTimeSeriesSelector,
    indexBy: ['chartClusterId', 'chartTime'],
  },
)
