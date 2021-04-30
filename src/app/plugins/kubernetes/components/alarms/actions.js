import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createContextLoader from 'core/helpers/createContextLoader'
import {
  alertsSelector,
  makeAlertsSelector,
  makeTimeSeriesSelector,
} from 'k8s/components/alarms/selectors'
import { allClustersSelector } from 'k8s/components/infrastructure/clusters/selectors'
import { ActionDataKeys } from 'k8s/DataKeys'
import moment from 'moment'
import { flatten, pluck } from 'ramda'
import { someAsync } from 'utils/async'
import {
  parseClusterParams,
  clusterActions,
  clusterTagActions,
} from '../infrastructure/clusters/actions'
import store from 'app/store'
import { loadAlertRules } from '../monitoring/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { prometheusCluster } from 'k8s/components/infrastructure/clusters/helpers'
import { hasPrometheusEnabled } from '../prometheus/helpers'

const { qbert } = ApiClient.getInstance()

export const alertsCacheKey = 'alerts'
export const alertsTimeSeriesCacheKey = 'alertsTimeSeries'

export const loadAlerts = createContextLoader(
  ActionDataKeys.Alerts,
  async (params) => {
    const clustersWithTasks = await clusterTagActions.list()
    const [clusterId, clusters] = await parseClusterParams(params)
    const filteredClusters = clusters.filter((cluster) => {
      const clusterWithTasks = clustersWithTasks.find(({ uuid }) => cluster.uuid === uuid)
      return hasPrometheusEnabled(clusterWithTasks)
    })
    await Promise.all([clusterActions.list(), loadAlertRules(params)])

    if (clusterId === allKey) {
      const clusterUuids = pluck('uuid', filteredClusters)
      return someAsync(clusterUuids.map(qbert.getAlertManagerAlerts)).then(flatten)
    }

    return qbert.getAlertManagerAlerts(clusterId)
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
const selector = allClustersSelector()

export const loadTimeSeriesAlerts = createContextLoader(
  ActionDataKeys.AlertsTimeSeries,
  async ({ chartTime, ...params }) => {
    const timeNow = moment().unix()
    const [number, period] = chartTime.split('.')
    const timePast = moment
      .unix(timeNow)
      .subtract(number, period)
      .unix()
    const step = timestampSteps[chartTime].join('')

    const [clusterId] = await parseClusterParams(params)

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
    selectorCreator: makeTimeSeriesSelector,
    cache: false,
  },
)

export const silenceActions = createCRUDActions(ActionDataKeys.Silences, {
  listFn: async (params) => {
    const [clusterId, clusters] = await parseClusterParams(params)
    return clusterId === allKey
      ? someAsync(pluck('uuid', clusters).map(qbert.getAlertManagerSilences)).then(flatten)
      : qbert.getAlertManagerSilences(clusterId)
  },
  createFn: async ({ clusterId, body }) => {
    return qbert.createAlertManagerSilence(clusterId, body)
  },
  deleteFn: async ({ id }, currentItems) => {
    const { clusterId } = await currentItems.find((x) => x.id === id)
    const result = await qbert.deleteAlertManagerSilence(clusterId, id)
    return result
  },
  uniqueIdentifier: 'id',
  indexBy: 'clusterId',
})
