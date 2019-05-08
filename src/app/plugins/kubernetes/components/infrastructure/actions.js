import { asyncMap, pathOrNull, pipeWhenTruthy } from 'app/utils/fp'
import { find, pathOr, pluck, prop, propEq } from 'ramda'
import { castFuzzyBool } from 'utils/misc'
import { combineHost } from './combineHosts'
import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const deleteCluster = contextUpdater('clusters', async ({ apiClient, currentItems, id }) => {
  await apiClient.qbert.deleteCluster(id)
  // Refresh clusters since combinedHosts will still
  // have references to the deleted cluster.
  return currentItems.filter(cluster => cluster.id === id)
})

export const loadCloudProviders = contextLoader('cloudProviders', async ({ apiClient }) => {
  return apiClient.qbert.getCloudProviders()
})

export const createCloudProvider = ({ apiClient, data }) =>
  apiClient.qbert.createCloudProvider(data)

export const updateCloudProvider = ({ apiClient, id, data }) =>
  apiClient.qbert.updateCloudProvider(id, data)

export const deleteCloudProvider = contextUpdater('cloudProviders', async ({ apiClient, currentItems, id }) => {
  await apiClient.qbert.deleteCloudProvider(id)
  return currentItems.filter(x => x.uuid !== id)
})

export const createCluster = async ({ data, context }) => {
  console.log('createCluster TODO')
  console.log(data)
}

export const attachNodesToCluster = contextUpdater('nodes', async ({ apiClient, currentItems, data }) => {
  const { clusterUuid, nodes } = data
  const nodeUuids = pluck('uuid', nodes)
  await apiClient.qbert.attach(clusterUuid, nodes)
  // Assign nodes to their clusters in the context as well so the user
  // can't add the same node to another cluster.
  return currentItems.map(node => nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid }) : node)
})

export const detachNodesFromCluster = contextUpdater('nodes', async ({ apiClient, currentItems, data }) => {
  const { clusterUuid, nodeUuids } = data
  await apiClient.qbert.detach(clusterUuid, nodeUuids)
  return currentItems.map(node =>
    nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid: null }) : node)
})

export const scaleCluster = async ({ apiClient, data }) => {
  const { cluster, numSpotWorkers, numWorkers, spotPrice } = data
  const body = {
    numWorkers,
    numSpotWorkers: numSpotWorkers || 0,
    spotPrice: spotPrice || 0.001,
    spotWorkerFlavor: cluster.cloudProperties.workerFlavor,
  }
  await apiClient.qbert.updateCluster(cluster.uuid, body)
}

// eslint-disable-next-line
const loadRawNodes = contextLoader('rawNodes', async ({ apiClient }) => {
  return apiClient.qbert.getNodes()
})

export const loadClusters = contextLoader('clusters', async ({ apiClient, loadFromContext }) => {
  const { qbert } = apiClient
  const [rawNodes, rawClusters, qbertEndpoint] = await Promise.all([
    loadFromContext('rawNodes'),
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

export const loadResMgrHosts = contextLoader('resmgrHosts', async ({ apiClient }) => {
  return apiClient.resmgr.getHosts()
})

export const loadCombinedHosts = contextLoader('combinedHosts', async ({ apiClient, loadFromContext }) => {
  const [rawNodes, resmgrHosts] = await Promise.all([
    loadFromContext('rawNodes'),
    loadFromContext('resmgrHosts'),
  ])

  let hostsById = {}
  // We don't want to perform a check to see if the object exists yet for each type of host
  // so make a utility to make it cleaner.
  const setHost = (type, id, value) => {
    hostsById[id] = hostsById[id] || {}
    hostsById[id][type] = value
  }
  rawNodes.forEach(node => setHost('qbert', node.uuid, node))
  resmgrHosts.forEach(resmgrHost => setHost('resmgr', resmgrHost.id, resmgrHost))

  // Convert it back to array form
  return Object.values(hostsById).map(combineHost)
})

export const loadNodes = contextLoader('nodes', async ({ apiClient, loadFromContext }) => {
  const [rawNodes, combinedHosts, serviceCatalog] = await Promise.all([
    loadFromContext('rawNodes'),
    loadFromContext('combinedHosts'),
    loadFromContext('serviceCatalog'),
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
