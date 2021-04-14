import { clientStoreKey } from 'core/client/clientReducers'
import createSorter from 'core/helpers/createSorter'
import getDataSelector from 'core/utils/getDataSelector'
import { hasPrometheusEnabled } from 'k8s/components/prometheus/helpers'
import DataKeys from 'k8s/DataKeys'
import { mergeLeft, pathOr, pipe } from 'ramda'
import { createSelector } from 'reselect'
import { filterIf } from 'utils/fp'
import { prometheusCluster } from '../clusters/helpers'

export const importedClustersSelector = createSelector(
  [
    getDataSelector<DataKeys.ImportedClusters>(DataKeys.ImportedClusters),
    getDataSelector<DataKeys.ClusterTags>(DataKeys.ClusterTags),
    (state) => pathOr('', [clientStoreKey, 'endpoints', 'qbert'])(state),
  ],
  (importedClusters, clustersWithTasks, qbertEndpoint) => {
    return importedClusters.map((cluster) => {
      const clusterWithTasks = clustersWithTasks.find(({ uuid }) => cluster.uuid === uuid)
      const host = qbertEndpoint.match(/(.*?)\/qbert/)[1]
      const grafanaLink =
        `${host}/k8s/v1/clusters/${cluster.uuid}/k8sapi/api/v1/` +
        `namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`
      const isPrometheusEnabled = hasPrometheusEnabled(clusterWithTasks)
      const usage = {
        grafanaLink: isPrometheusEnabled ? grafanaLink : null,
      }

      return {
        ...cluster,
        name: cluster.spec?.displayName,
        cloudProviderId: cluster.spec?.cloudProviderID,
        external: cluster.metadata?.labels?.external,
        region: cluster.metadata?.labels?.region,
        kubeVersion: cluster.spec?.kubeVersion,
        creationTimestamp: cluster.metadata?.creationTimestamp,
        containerCidr: cluster.spec?.eks?.network?.containerCidr,
        servicesCidr: cluster.spec?.eks?.network?.servicesCidr,
        nodeGroups: cluster.spec?.eks?.nodegroups,
        providerType: cluster.metadata?.labels?.provider,
        workers: cluster.status?.workers,
        usage,
        hasPrometheus: isPrometheusEnabled,
      }
    })
  },
)

export const makeParamsImportedClustersSelector = (
  defaultParams = {
    orderBy: 'creationTimestamp',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [importedClustersSelector, (_, params) => mergeLeft(params, defaultParams)],
    (clusters, params) => {
      const { orderBy, orderDirection, prometheusClusters } = params
      return pipe<any, any, any>(
        filterIf(prometheusClusters, prometheusCluster),
        createSorter({ orderBy, orderDirection }),
      )(clusters)
    },
  )
}
