import ApiClient from 'api-client/ApiClient'
import { allKey } from 'app/constants'
import createContextLoader from 'core/helpers/createContextLoader'
import { alertRulesSelector, makeAlertRulesSelector } from 'k8s/components/monitoring/selectors'
import { prometheusRuleActions } from 'k8s/components/prometheus/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { flatten, pluck } from 'ramda'
import { someAsync } from 'utils/async'
import { parseClusterParams } from '../infrastructure/clusters/actions'
import { hasPrometheusTag } from 'k8s/components/infrastructure/clusters/helpers'
import { importedHasPrometheusTag } from 'k8s/components/infrastructure/importedClusters/helpers'
import { isPrometheusCluster } from 'k8s/components/alarms/actions'

const { qbert } = ApiClient.getInstance()

export const alertRulesCacheKey = 'alertRules'

export const loadAlertRules = createContextLoader(
  ActionDataKeys.AlertRules,
  async (params) => {
    // Fetch dependent cache used in selector later
    await prometheusRuleActions.list()

    const [clusterId, clusters] = await parseClusterParams(params)
    const filteredClusters = clusters.filter((cluster) => isPrometheusCluster(cluster))
    if (clusterId === allKey) {
      return someAsync(pluck('uuid', filteredClusters).map(qbert.getPrometheusAlertRules)).then(
        flatten,
      )
    }
    return qbert.getPrometheusAlertRules(clusterId)
  },
  {
    entityName: 'AlertRule',
    uniqueIdentifier: 'id',
    indexBy: 'clusterId',
    selector: alertRulesSelector,
    selectorCreator: makeAlertRulesSelector,
  },
)
