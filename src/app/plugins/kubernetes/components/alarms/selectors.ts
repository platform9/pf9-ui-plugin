import { createSelector } from 'reselect'
import { pathOr, path, pipe, find, propEq, prop } from 'ramda'
import { emptyArr, pathStr } from 'utils/fp'
import { cacheStoreKey, dataStoreKey } from 'core/caching/cacheReducers'
import { alertsCacheKey } from 'k8s/components/alarms/actions'
import { makeParamsClustersSelector } from 'k8s/components/infrastructure/clusters/selectors'

const getQbertUrl = (qbertEndpoint) => {
  // Trim the uri after "/qbert" from the qbert endpoint
  return qbertEndpoint.match(/(.*?)\/qbert/)[1]
}

export const alertsSelector = createSelector([
  pathOr(emptyArr, [cacheStoreKey, dataStoreKey, alertsCacheKey]),
  makeParamsClustersSelector({
    healthyClusters: true,
    prometheusClusters: true,
  }),
  pathOr(emptyArr, ['qbert', 'endpoint']),
], (alerts, clusters, qbertEndpoint) => {
  const qbertPath = getQbertUrl(qbertEndpoint)
  return alerts.map(alert => ({
    ...alert,
    severity: pathStr('labels.severity', alert),
    summary: pathStr('annotations.message', alert),
    activeAt: path(['alerts', 0, 'activeAt'], alert),
    status: alert.alerts.length ? 'Active' : 'Closed',
    clusterName: pipe(find(propEq('uuid', alert.clusterId)), prop('name'))(clusters),
    grafanaLink: `${qbertPath}/k8s/v1/clusters/${alert.clusterId}/k8sapi/api/v1/namespaces` +
      `/pf9-monitoring/services/http:grafana-ui:80/proxy/`,
  }))
})
