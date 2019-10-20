import { pathStrOrNull, pipeWhenTruthy, isTruthy } from 'app/utils/fp'
import {
  find, pathOr, pluck, prop, propEq, propSatisfies, compose, path, pipe, either,
} from 'ramda'
import { allKey } from 'app/constants'
import { castFuzzyBool, capitalizeString } from 'utils/misc'
import { combineHost } from './combineHosts'
import { serviceCatalogContextKey } from 'openstack/components/api-access/actions'
import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { filterIf, pathStrOr } from 'utils/fp'
import { mapAsync, tryCatchAsync } from 'utils/async'
import calcUsageTotals from 'k8s/util/calcUsageTotals'

export const clustersCacheKey = 'clusters'
export const cloudProvidersCacheKey = 'cloudProviders'
export const nodesCacheKey = 'nodes'
export const rawNodesCacheKey = 'rawNodes'
export const resMgrHostsCacheKey = 'resMgrHosts'
export const combinedHostsCacheKey = 'combinedHosts'

const { qbert, resmgr } = ApiClient.getInstance()

// eslint-disable-next-line
const loadRawNodes = createContextLoader(rawNodesCacheKey, async () => {
  return qbert.getNodes()
}, { uniqueIdentifier: 'uuid' })

export const loadResMgrHosts = createContextLoader(resMgrHostsCacheKey, async () => {
  return resmgr.getHosts()
}, {
  uniqueIdentifier: 'uuid',
})

export const hasMasterNode = propSatisfies(isTruthy, 'hasMasterNode')
export const masterlessCluster = propSatisfies(isTruthy, 'masterless')
export const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))
export const hasAppCatalogEnabled = propSatisfies(isTruthy, 'appCatalogEnabled')

// If params.clusterId is not assigned it fetches all clusters and extracts the clusterId from the first cluster
// It also adds a "clusters" param that contains all the clusters, just for convenience
export const parseClusterParams = async (params, loadFromContext) => {
  const clusters = await loadFromContext(clustersCacheKey, params)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) } = params
  return [clusterId, clusters]
}

const getProgressPercent = async clusterId => {
  return tryCatchAsync(
    async () => {
      const { progressPercent } = await qbert.getClusterDetails(clusterId)
      return progressPercent
    },
    e => {
      console.warn(e)
      return null
    })(null)
}

const getKubernetesVersion = async clusterId => {
  return tryCatchAsync(
    async () => {
      const version = await qbert.getKubernetesVersion(clusterId)
      return version && version.gitVersion && version.gitVersion.substr(1)
    },
    e => {
      console.warn(e)
      return null
    })(null)
}

export const clusterActions = createCRUDActions(clustersCacheKey, {
  createFn: (params) => qbert.createCluster(params),
  listFn: async (params, loadFromContext) => {
    const [rawNodes, combinedHosts, rawClusters, qbertEndpoint] = await Promise.all([
      loadFromContext(rawNodesCacheKey),
      loadFromContext(combinedHostsCacheKey),
      qbert.getClusters(),
      qbert.baseUrl(),
    ])
    return mapAsync(async cluster => {
      const nodesInCluster = rawNodes.filter(node => node.clusterUuid === cluster.uuid)
      const nodeIds = pluck('uuid', nodesInCluster)
      const combinedNodes = combinedHosts.filter(x => nodeIds.includes(x.resmgr.id))
      const calcNodesTotals = calcUsageTotals(combinedNodes)
      const usage = {
        compute: calcNodesTotals('usage.compute.current', 'usage.compute.max'),
        memory: calcNodesTotals('usage.memory.current', 'usage.memory.max'),
        disk: calcNodesTotals('usage.disk.current', 'usage.disk.max'),
      }
      const masterNodes = nodesInCluster.filter(node => node.isMaster === 1)
      const healthyMasterNodes = masterNodes.filter(
        node => node.status === 'ok' && node.api_responding === 1)
      const hasMasterNode = healthyMasterNodes.length > 0
      const clusterOk = nodesInCluster.length > 0 && cluster.status === 'ok'
      const dashboardLink = `${qbertEndpoint}/clusters/${cluster.uuid}/k8sapi/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:443/proxy/`
      const host = qbertEndpoint.match(/(.*?)\/qbert/)[1]
      const fuzzyBools = ['allowWorkloadsOnMaster', 'privileged', 'appCatalogEnabled'].reduce(
        (accum, key) => {
          accum[key] = castFuzzyBool(cluster[key])
          return accum
        },
        {},
      )
      const progressPercent = cluster.taskStatus === 'converging'
        ? await getProgressPercent(cluster.uuid)
        : null
      const version = hasMasterNode
        ? await getKubernetesVersion(cluster.uuid)
        : null

      return {
        ...cluster,
        usage,
        version: version || 'N/A',
        nodes: nodesInCluster,
        masterNodes,
        progressPercent,
        healthyMasterNodes,
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
        hasLoadBalancer: castFuzzyBool(cluster.enableMetallb || pathOr(false, ['cloudProperties', 'enableLbaas'], cluster)),
      }
    }, rawClusters)
  },
  deleteFn: async ({ id }) => {
    await qbert.deleteCluster(id)
    // Refresh clusters since combinedHosts will still
    // have references to the deleted cluster.
    loadCombinedHosts.invalidateCache()
  },
  uniqueIdentifier: 'uuid',
  dataMapper: (items,
    { masterNodeClusters, masterlessClusters, hasControlPanel, appCatalogClusters, prometheusClusters }) => pipe(
    filterIf(masterNodeClusters, hasMasterNode),
    filterIf(masterlessClusters, masterlessCluster),
    filterIf(prometheusClusters, hasPrometheusEnabled),
    filterIf(appCatalogClusters, hasAppCatalogEnabled),
    filterIf(hasControlPanel, either(hasMasterNode, masterlessCluster)),
  )(items),
  defaultOrderBy: 'name',
})

export const createCluster = async ({ data, context }) => {
  console.log('createCluster TODO')
  console.log(data)
}
const cloudProviderTypes = {
  aws: 'Amazon AWS Provider',
  azure: 'Microsoft Azure Provider',
  openstack: 'OpenStack',
}
export const cloudProviderActions = createCRUDActions(cloudProvidersCacheKey, {
  listFn: () => qbert.getCloudProviders(),
  createFn: (params) => qbert.createCloudProvider(params),
  updateFn: ({ id, ...data }) => qbert.updateCloudProvider(id, data),
  deleteFn: ({ id }) => qbert.deleteCloudProvider(id),
  customOperations: {
    attachNodesToCluster: async ({ clusterUuid, nodes }, currentItems) => {
      const nodeUuids = pluck('uuid', nodes)
      await qbert.attach(clusterUuid, nodes)
      // Assign nodes to their clusters in the context as well so the user
      // can't add the same node to another cluster.
      return currentItems.map(node =>
        nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid }) : node)
    },
    detachNodesFromCluster: async ({ clusterUuid, nodeUuids }, currentItems) => {
      await qbert.detach(clusterUuid, nodeUuids)
      return currentItems.map(node =>
        nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid: null }) : node)
    },
  },
  refetchCascade: true,
  dataMapper: async (items, params, loadFromContext) => {
    const [clusters, combinedHosts] = await Promise.all([
      loadFromContext(clustersCacheKey),
      loadFromContext(combinedHostsCacheKey),
    ])
    const getNodesHosts = nodeIds =>
      combinedHosts.filter(propSatisfies(id => nodeIds.includes(id), 'id'))
    const usagePathStr = 'resmgr.extensions.resource_usage.data'

    return items.map(cloudProvider => {
      const descriptiveType = cloudProviderTypes[cloudProvider.type] || capitalizeString(cloudProvider.type)
      const filterCpClusters = propEq('nodePoolUuid', cloudProvider.nodePoolUuid)
      const cpClusters = clusters.filter(filterCpClusters)
      const cpNodes = pluck('nodes', cpClusters).flat()
      const cpHosts = getNodesHosts(pluck('uuid', cpNodes))
      const calcDeployedCapacity = calcUsageTotals(cpHosts)
      const deployedCapacity = {
        compute: calcDeployedCapacity(`${usagePathStr}.cpu.used`, `${usagePathStr}.cpu.total`),
        memory: calcDeployedCapacity(
          item => pathStrOr(0, `${usagePathStr}.memory.total`, item) - pathStrOr(0, `${usagePathStr}.memory.available`, item),
          `${usagePathStr}.memory.total`, true),
        disk: calcDeployedCapacity(`${usagePathStr}.disk.used`, `${usagePathStr}.disk.total`),
      }

      return {
        ...cloudProvider,
        descriptiveType,
        deployedCapacity,
        clusters: cpClusters,
        nodes: cpNodes,
      }
    })
  },
  uniqueIdentifier: 'uuid',
})

export const loadCloudProviderDetails = createContextLoader(
  'cloudProviderDetails',
  async ({ cloudProviderId }) => {
    const response = await qbert.getCloudProviderDetails(cloudProviderId)
    return response.Regions
  },
  {
    uniqueIdentifier: 'RegionName',
    indexBy: 'cloudProviderId',
  },
)

export const loadCloudProviderRegionDetails = createContextLoader(
  'cloudProviderRegionDetails',
  async ({ cloudProviderId, cloudProviderRegionId }) => {
    const response = await qbert.getCloudProviderRegionDetails(cloudProviderId, cloudProviderRegionId)
    // We create an artificial `id` parameter in the response so that createContextLoader has a
    // uniqueIdentifier to key off of.  Failure to do this results in inproperly cached values.
    return { id: `${cloudProviderId}-${cloudProviderRegionId}`, ...response }
  },
  {
    indexBy: ['cloudProviderId', 'cloudProviderRegionId'],
  },
)

export const flavorActions = createCRUDActions('flavors', { service: 'nova' })

export const regionActions = createCRUDActions('regions', { service: 'keystone' })

export const scaleCluster = async ({ data }) => {
  const { cluster, numSpotWorkers, numWorkers, spotPrice } = data
  const body = {
    numWorkers,
    numSpotWorkers: numSpotWorkers || 0,
    spotPrice: spotPrice || 0.001,
    spotWorkerFlavor: cluster.cloudProperties.workerFlavor,

  }
  await qbert.updateCluster(cluster.uuid, body)
}

export const loadCombinedHosts = createContextLoader(combinedHostsCacheKey, async (params,
  loadFromContext) => {
  const [rawNodes, resMgrHosts] = await Promise.all([
    loadFromContext(rawNodesCacheKey),
    loadFromContext(resMgrHostsCacheKey),
  ])

  let hostsById = {}
  // We don't want to perform a check to see if the object exists yet for each type of host
  // so make a utility to make it cleaner.
  const setHost = (type, id, value) => {
    hostsById[id] = hostsById[id] || {}
    hostsById[id][type] = value
  }
  rawNodes.forEach(node => setHost('qbert', node.uuid, node))
  resMgrHosts.forEach(resMgrHost => setHost('resmgr', resMgrHost.id, resMgrHost))

  // Convert it back to array form
  return Object.values(hostsById).map(combineHost)
}, {
  uniqueIdentifier: 'id',
})

export const loadNodes = createContextLoader(nodesCacheKey, async (params, loadFromContext) => {
  const [rawNodes, combinedHosts, serviceCatalog] = await Promise.all([
    loadFromContext(rawNodesCacheKey),
    loadFromContext(combinedHostsCacheKey),
    loadFromContext(serviceCatalogContextKey),
  ])

  const combinedHostsObj = combinedHosts.reduce(
    (accum, host) => {
      const id = pathStrOrNull('resmgr.id')(host) || pathStrOrNull('qbert.uuid')(host)
      accum[id] = host
      return accum
    },
    {},
  )

  const qbertUrl = pipeWhenTruthy(
    find(propEq('name', 'qbert')),
    prop('url'),
  )(serviceCatalog) || ''

  // associate nodes with the combinedHost entry
  return rawNodes.map(node => ({
    ...node,
    combined: combinedHostsObj[node.uuid],
    logs: `${qbertUrl}/logs/${node.uuid}`,
  }))
}, {
  uniqueIdentifier: 'uuid',
})
