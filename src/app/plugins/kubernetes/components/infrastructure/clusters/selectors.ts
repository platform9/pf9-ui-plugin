import { createSelector } from 'reselect'
import { either, mergeLeft, partition, pathOr, pipe, pluck } from 'ramda'
import { filterIf } from 'utils/fp'
import createSorter, { SortConfig } from 'core/helpers/createSorter'
import {
  getConnectionStatus,
  getHealthStatus,
  getMasterNodesHealthStatus,
  getWorkerNodesHealthStatus,
} from 'k8s/components/infrastructure/clusters/ClusterStatusUtils'
import { castFuzzyBool } from 'utils/misc'
import DataKeys from 'k8s/DataKeys'
import getDataSelector from 'core/utils/getDataSelector'
import { IClusterSelector } from './model'
import { clientStoreKey } from 'core/client/clientReducers'
import {
  getK8sDashboardLinkFromVersion,
  getScopedClusterProxyEndpoint,
  hasAppCatalogEnabled,
  hasHealthyMasterNodes,
  hasMasterNode,
  masterlessCluster,
  prometheusCluster,
} from 'k8s/components/infrastructure/clusters/helpers'
import { nodesSelector } from 'k8s/components/infrastructure/nodes/selectors'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'
import { hasPrometheusEnabled } from 'k8s/components/prometheus/helpers'
import { INodesSelector } from 'k8s/components/infrastructure/nodes/model'
import { calculateNodeUsages } from '../common/helpers'
import { importedClustersSelector } from '../importedClusters/selectors'

export const clustersSelector = createSelector(
  [
    getDataSelector<DataKeys.Clusters>(DataKeys.Clusters),
    getDataSelector<DataKeys.ClusterTags>(DataKeys.ClusterTags),
    nodesSelector,
    combinedHostsSelector,
    (state) => pathOr('', [clientStoreKey, 'endpoints', 'qbert'])(state),
  ],
  (
    rawClusters,
    clustersWithTasks,
    nodes: INodesSelector[],
    combinedHosts,
    qbertEndpoint: string,
  ) => {
    return rawClusters.map((cluster) => {
      const clusterWithTasks = clustersWithTasks.find(({ uuid }) => cluster.uuid === uuid)
      const nodesInCluster = nodes.filter((node) => node.clusterUuid === cluster.uuid)
      const nodeIds = pluck('uuid', nodesInCluster)
      const combinedNodes = combinedHosts.filter((x) => nodeIds.includes(x?.resmgr?.id))
      const proxyEndpoint = getScopedClusterProxyEndpoint(
        qbertEndpoint.replace(/\/qbert\//, '/k8s/'),
        cluster,
      )
      const grafanaLink = `${proxyEndpoint}/namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`
      const isPrometheusEnabled = hasPrometheusEnabled(clusterWithTasks)
      const _usage = calculateNodeUsages(combinedNodes)
      const usage = {
        ..._usage,
        grafanaLink: isPrometheusEnabled ? grafanaLink : null,
      }
      const isMasterNode = (node) => node.isMaster === 1
      const [masterNodes, workerNodes] = partition(isMasterNode, nodesInCluster)
      const healthyMasterNodes = masterNodes.filter((node) => node.status === 'ok')
      const healthyWorkerNodes = workerNodes.filter((node) => node.status === 'ok')
      const masterNodesHealthStatus = getMasterNodesHealthStatus(masterNodes, healthyMasterNodes)
      const workerNodesHealthStatus = getWorkerNodesHealthStatus(workerNodes, healthyWorkerNodes)
      const connectionStatus = getConnectionStatus(cluster.taskStatus, nodesInCluster)
      const healthStatus = getHealthStatus(
        connectionStatus,
        masterNodesHealthStatus,
        workerNodesHealthStatus,
      )
      const hasMasterNode = healthyMasterNodes.length > 0
      const clusterOk = nodesInCluster.length > 0 && cluster.status === 'ok'
      const fuzzyBools = ['allowWorkloadsOnMaster', 'privileged', 'appCatalogEnabled'].reduce(
        (accum, key) => {
          accum[key] = castFuzzyBool(cluster[key])
          return accum
        },
        {},
      )
      const dashboardLink = getK8sDashboardLinkFromVersion(cluster.version, qbertEndpoint, cluster)
      return {
        ...cluster,
        tasks: clusterWithTasks ? clusterWithTasks.pkgs : [],
        version: (hasMasterNode && cluster.version) || 'N/A',
        usage,
        nodes: nodesInCluster,
        masterNodes,
        workerNodes,
        healthyMasterNodes,
        healthyWorkerNodes,
        masterNodesHealthStatus,
        workerNodesHealthStatus,
        connectionStatus,
        healthStatus,
        hasMasterNode,
        highlyAvailable: healthyMasterNodes.length > 2,
        links: {
          dashboard: clusterOk ? dashboardLink : null,
          // Rendering happens in <DownloadKubeConfigLink />
          kubeconfig: clusterOk ? { cluster } : null,
          // Rendering happens in <ClusterCLI />
          cli: clusterOk ? { host: qbertEndpoint.match(/(.*?)\/qbert/)[1], cluster } : null,
        },
        ...fuzzyBools,
        hasVpn: castFuzzyBool(pathOr(false, ['cloudProperties', 'internalElb'], cluster)),
        hasLoadBalancer: castFuzzyBool(
          cluster.enableMetallb || pathOr(false, ['cloudProperties', 'enableLbaas'], cluster),
        ),
        etcdBackupEnabled: castFuzzyBool(
          pathOr(false, ['etcdBackup', 'isEtcdBackupEnabled'], cluster),
        ),
        hasPrometheus: isPrometheusEnabled,
        clusterType: 'normal',
      }
    })
  },
)

export const makeParamsClustersSelector = (
  defaultParams: SortConfig = {
    orderBy: 'created_at',
    orderDirection: 'desc',
  },
) => {
  return createSelector(
    [clustersSelector, (_, params) => mergeLeft(params, defaultParams)],
    (clusters, params) => {
      const {
        masterNodeClusters,
        masterlessClusters,
        hasControlPanel,
        healthyClusters,
        appCatalogClusters,
        prometheusClusters,
        orderBy,
        orderDirection,
      } = params
      return pipe<
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[]
      >(
        filterIf(masterNodeClusters, hasMasterNode),
        filterIf(masterlessClusters, masterlessCluster),
        filterIf(prometheusClusters, prometheusCluster),
        filterIf(appCatalogClusters, hasAppCatalogEnabled),
        filterIf(hasControlPanel, either(hasMasterNode, masterlessCluster)),
        filterIf(healthyClusters, hasHealthyMasterNodes),
        createSorter({ orderBy, orderDirection }),
      )(clusters)
    },
  )
}

export const allClustersSelector = (
  defaultParams: SortConfig = {
    orderBy: 'name',
    orderDirection: 'asc',
  },
) => {
  return createSelector(
    [clustersSelector, importedClustersSelector, (_, params) => mergeLeft(params, defaultParams)],
    (clusters, importedClusters, params) => {
      const {
        masterNodeClusters,
        masterlessClusters,
        hasControlPanel,
        healthyClusters,
        appCatalogClusters,
        prometheusClusters,
        orderBy,
        orderDirection,
      } = params
      // I want to reuse the makeParamsClusterSelector etc. here instead of code
      // repetition but I don't know how to do so
      const filteredClusters = pipe<
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[],
        IClusterSelector[]
      >(
        filterIf(masterNodeClusters, hasMasterNode),
        filterIf(masterlessClusters, masterlessCluster),
        filterIf(prometheusClusters, prometheusCluster),
        filterIf(appCatalogClusters, hasAppCatalogEnabled),
        filterIf(hasControlPanel, either(hasMasterNode, masterlessCluster)),
        filterIf(healthyClusters, hasHealthyMasterNodes),
      )(clusters)

      const filteredImportedClusters = pipe<any, any>(
        filterIf(prometheusClusters, prometheusCluster),
      )(importedClusters)

      const allClusters = [...filteredClusters, ...filteredImportedClusters]
      return createSorter({ orderBy, orderDirection })(allClusters)
    },
  )
}
