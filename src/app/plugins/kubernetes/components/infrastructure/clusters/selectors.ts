import { createSelector } from 'reselect'
import {
  compose,
  either,
  mergeLeft,
  partition,
  path,
  pathOr,
  pipe,
  pluck,
  propSatisfies,
} from 'ramda'
import { filterIf, isTruthy } from 'utils/fp'
import createSorter, { SortConfig } from 'core/helpers/createSorter'
import calcUsageTotalByPath from 'k8s/util/calcUsageTotals'
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
import { Node } from 'api-client/qbert.model'
import { clientStoreKey } from 'core/client/clientReducers'
import { getK8sDashboardLinkFromVersion } from 'k8s/components/infrastructure/clusters/helpers'
import { combinedHostsSelector } from 'k8s/components/infrastructure/common/selectors'

const monitoringTask = 'pf9-mon'
const isMonitoringTask = (task: any = {}) =>
  task.pkg_id === monitoringTask && task.type === 'Install'
const getMostRecentTask = (prev, curr) => (prev.task_id > curr.task_id ? prev : curr)
const hasPrometheusEnabled = (cluster) => {
  if (!cluster) return false
  const installedMonitoringTask = (cluster.tasks || [])
    .filter(isMonitoringTask)
    .reduce(getMostRecentTask, {})

  return installedMonitoringTask.status === 'Complete'
}
export const hasMasterNode = propSatisfies(isTruthy, 'hasMasterNode')
export const hasHealthyMasterNodes = propSatisfies(
  (healthyMasterNodes: Node[]) => healthyMasterNodes.length > 0,
  'healthyMasterNodes',
)
export const masterlessCluster = propSatisfies(isTruthy, 'masterless')
export const hasPrometheusTag = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))
export const hasAppCatalogEnabled = propSatisfies(isTruthy, 'appCatalogEnabled')

export const clustersSelector = createSelector(
  [
    getDataSelector<DataKeys.Clusters>(DataKeys.Clusters),
    getDataSelector<DataKeys.ClusterTags>(DataKeys.ClusterTags),
    getDataSelector<DataKeys.Nodes>(DataKeys.Nodes),
    combinedHostsSelector,
    (state) => pathOr('', [clientStoreKey, 'endpoints', 'qbert'])(state),
  ],
  (rawClusters, clustersWithTasks, rawNodes, combinedHosts, qbertEndpoint: string) => {
    return rawClusters.map((cluster) => {
      const clusterWithTasks = clustersWithTasks.find(({ uuid }) => cluster.uuid === uuid)
      const nodesInCluster = rawNodes.filter((node) => node.clusterUuid === cluster.uuid)
      const nodeIds = pluck('uuid', nodesInCluster)
      const combinedNodes = combinedHosts.filter((x) => nodeIds.includes(x?.resmgr?.id))
      const calcNodesTotals = calcUsageTotalByPath(combinedNodes)
      const host = qbertEndpoint.match(/(.*?)\/qbert/)[1]
      const grafanaLink =
        `${host}/k8s/v1/clusters/${cluster.uuid}/k8sapi/api/v1/` +
        `namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`
      const isPrometheusEnabled = hasPrometheusEnabled(clusterWithTasks)
      const usage = {
        compute: calcNodesTotals('usage.compute.current', 'usage.compute.max'),
        memory: calcNodesTotals('usage.memory.current', 'usage.memory.max'),
        disk: calcNodesTotals('usage.disk.current', 'usage.disk.max'),
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
        cluster.canUpgrade,
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
          cli: clusterOk ? { host, cluster } : null,
        },
        ...fuzzyBools,
        hasVpn: castFuzzyBool(pathOr(false, ['cloudProperties', 'internalElb'], cluster)),
        hasLoadBalancer: castFuzzyBool(
          cluster.enableMetallb || pathOr(false, ['cloudProperties', 'enableLbaas'], cluster),
        ),
        etcdBackupEnabled: castFuzzyBool(
          pathOr(false, ['etcdBackup', 'isEtcdBackupEnabled'], cluster),
        ),
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
        filterIf(prometheusClusters, hasPrometheusTag),
        filterIf(appCatalogClusters, hasAppCatalogEnabled),
        filterIf(hasControlPanel, either(hasMasterNode, masterlessCluster)),
        filterIf(healthyClusters, hasHealthyMasterNodes),
        createSorter({ orderBy, orderDirection }),
      )(clusters)
    },
  )
}
