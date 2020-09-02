import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createContextLoader from 'core/helpers/createContextLoader'
import {
  alertsSelector,
  makeAlertsSelector,
  makeTimeSeriesSelector,
} from 'k8s/components/alarms/selectors'
import {
  hasHealthyMasterNodes,
  hasPrometheusTag,
  makeParamsClustersSelector,
} from 'k8s/components/infrastructure/clusters/selectors'
import { ActionDataKeys } from 'k8s/DataKeys'
import moment from 'moment'
import { filter, flatten, pipe, pluck } from 'ramda'
import { someAsync } from 'utils/async'
import { parseClusterParams } from '../infrastructure/clusters/actions'

import store from 'app/store'

const { qbert } = ApiClient.getInstance()

export const alertsCacheKey = 'alerts'
export const alertsTimeSeriesCacheKey = 'alertsTimeSeries'

export const loadAlerts = createContextLoader(
  ActionDataKeys.Alerts,
  async (params) => {
    const [clusterId, clusters] = await parseClusterParams(params)
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', clusters).map(qbert.getPrometheusAlerts)).then(flatten)
    }
    return qbert.getPrometheusAlerts(clusterId)
  },
  {
    entityName: 'Alert',
    uniqueIdentifier: 'id',
    indexBy: 'clusterId',
    selector: alertsSelector,
    selectorCreator: makeAlertsSelector,
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
  async ({ chartTime, ...params }) => {
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

    const [clusterId] = await parseClusterParams(params)
    const selector = makeParamsClustersSelector()
    const prometheusClusters = selector(store.getState(), {
      ...params,
      healthyClusters: true,
      prometheusClusters: true,
    })

    if (clusterId === allKey) {
      return someAsync(
        pluck('uuid', prometheusClusters).map((clusterUuid) =>
          qbert.getPrometheusAlertsOverTime(clusterUuid, timePast, timeNow, step),
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
    indexBy: ['clusterId', 'chartTime'],
  },
)
