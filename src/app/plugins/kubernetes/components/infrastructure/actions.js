import { asyncMap, pathOrNull, pipeWhenTruthy } from 'app/utils/fp'
import { find, pathOr, pluck, prop, propEq } from 'ramda'
import { allKey } from 'app/constants'
import { castFuzzyBool } from 'utils/misc'
import { combineHost } from './combineHosts'
import { serviceCatalogContextKey } from 'openstack/components/api-access/actions'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import ApiClient from 'api-client/ApiClient'

export const clustersContextKey = 'clusters'
export const cloudProvidersContextKey = 'cloudProviders'
export const nodesContextKey = 'nodes'
export const rawNodesContextKey = 'rawNodes'
export const resMgrHostsContextKey = 'resMgrHosts'
export const combinedHostsContextKey = 'combinedHosts'

// If params.clusterId is not assigned it fetches all clusters and extracts the clusterId from the first cluster
// It also adds a "clusters" param that contains all the clusters, just for convenience
export const parseClusterParams = async (params, loadFromContext) => {
  const clusters = await loadFromContext(clustersContextKey)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) || allKey } = params
  return [ clusterId, clusters ]
}

export const deleteCluster = createContextUpdater(clustersContextKey, async ({ id }) => {
  const { qbert } = ApiClient.getInstance()
  await qbert.deleteCluster(id)
  // Refresh clusters since combinedHosts will still
  // have references to the deleted cluster.
}, { operation: 'delete' })

export const loadCloudProviders = createContextLoader(cloudProvidersContextKey, async () => {
  const { qbert } = ApiClient.getInstance()
  return qbert.getCloudProviders()
})

export const createCloudProvider = ({ data }) => {
  const { qbert } = ApiClient.getInstance()
  return qbert.createCloudProvider(data)
}

export const updateCloudProvider = createContextUpdater(cloudProvidersContextKey, ({ id, data }) => {
  const { qbert } = ApiClient.getInstance()
  return qbert.updateCloudProvider(id, data)
}, { operation: 'update' })

export const deleteCloudProvider = createContextUpdater(cloudProvidersContextKey, async ({ id }) => {
  const { qbert } = ApiClient.getInstance()
  await qbert.deleteCloudProvider(id)
}, { operation: 'delete' })

export const createCluster = async ({ data, context }) => {
  console.log('createCluster TODO')
  console.log(data)
}

export const attachNodesToCluster = createContextUpdater(nodesContextKey, async ({ clusterUuid, nodes }, currentItems) => {
  const { qbert } = ApiClient.getInstance()
  const nodeUuids = pluck('uuid', nodes)
  await qbert.attach(clusterUuid, nodes)
  // Assign nodes to their clusters in the context as well so the user
  // can't add the same node to another cluster.
  return currentItems.map(node => nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid }) : node)
})

export const detachNodesFromCluster = createContextUpdater(nodesContextKey, async ({ clusterUuid, nodeUuids }, currentItems) => {
  const { qbert } = ApiClient.getInstance()
  await qbert.detach(clusterUuid, nodeUuids)
  return currentItems.map(node =>
    nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid: null }) : node)
})

export const scaleCluster = async ({ data }) => {
  const { qbert } = ApiClient.getInstance()
  const { cluster, numSpotWorkers, numWorkers, spotPrice } = data
  const body = {
    numWorkers,
    numSpotWorkers: numSpotWorkers || 0,
    spotPrice: spotPrice || 0.001,
    spotWorkerFlavor: cluster.cloudProperties.workerFlavor,

  }
  await qbert.updateCluster(cluster.uuid, body)
}

// eslint-disable-next-line
const loadRawNodes = createContextLoader(rawNodesContextKey, async () => {
  const { qbert } = ApiClient.getInstance()
  return qbert.getNodes()
})

export const loadClusters = createContextLoader(clustersContextKey, async (params, loadFromContext) => {
  const { qbert } = ApiClient.getInstance()
  const [rawNodes, rawClusters, qbertEndpoint] = await Promise.all([
    loadFromContext(rawNodesContextKey),
    qbert.getClusters(),
    qbert.baseUrl(),
  ])

  const clusters = rawClusters.map(cluster => {
    const nodesInCluster = rawNodes.filter(node => node.clusterUuid === cluster.uuid)
    const masterNodes = nodesInCluster.filter(node => node.isMaster === 1)
    const healthyMasterNodes = masterNodes.filter(
      node => node.status === 'ok' && node.api_responding === 1)
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
    return {
      ...cluster,
      nodes: nodesInCluster,
      masterNodes,
      healthyMasterNodes,
      hasMasterNode: healthyMasterNodes.length > 0,
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
  })
  // Get the cluster versions in parallel
  return asyncMap(clusters, async cluster => {
    if (cluster.hasMasterNode) {
      try {
        const version = await qbert.getKubernetesVersion(cluster.uuid)
        return {
          ...cluster,
          version: version && version.gitVersion && version.gitVersion.substr(1),
        }
      } catch (err) {
        console.log(err)
        return cluster
      }
    } else {
      return cluster
    }
  }, true)
})

export const loadResMgrHosts = createContextLoader(resMgrHostsContextKey, async () => {
  const { resmgr } = ApiClient.getInstance()
  return resmgr.getHosts()
})

export const loadCombinedHosts = createContextLoader(combinedHostsContextKey, async (params, loadFromContext) => {
  const [rawNodes, resMgrHosts] = await Promise.all([
    loadFromContext(rawNodesContextKey),
    loadFromContext(resMgrHostsContextKey),
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
})

export const loadNodes = createContextLoader(nodesContextKey, async (params, loadFromContext) => {
  const [rawNodes, combinedHosts, serviceCatalog] = await Promise.all([
    loadFromContext(rawNodesContextKey),
    loadFromContext(combinedHostsContextKey),
    loadFromContext(serviceCatalogContextKey),
  ])

  const combinedHostsObj = combinedHosts.reduce(
    (accum, host) => {
      const id = pathOrNull('resmgr.id')(host) || pathOrNull('qbert.uuid')(host)
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
})
