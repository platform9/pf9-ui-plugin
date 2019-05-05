import { asyncFlatMap, asyncMap, pathOrNull, pipeWhenTruthy } from 'app/utils/fp'
import { find, pathOr, pluck, prop, propEq } from 'ramda'
import { castFuzzyBool } from 'utils/misc'
import { combineHost } from './combineHosts'
import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

export const deleteCluster = async ({ id, context, setContext }) => {
  await context.apiClient.qbert.deleteCluster(id)
  // Refresh clusters since combinedHosts will still
  // have references to the deleted cluster.
  const clusters = await loadClusters({ context })
  setContext({ clusters })
}

export const loadCloudProviders = contextLoader('cloudProviders', async ({ context }) => {
  return context.apiClient.qbert.getCloudProviders()
})

export const createCloudProvider = ({ data, context }) =>
  context.apiClient.qbert.createCloudProvider(data)

export const updateCloudProvider = ({ id, data, context }) =>
  context.apiClient.qbert.updateCloudProvider(id, data)

export const deleteCloudProvider = contextUpdater('cloudProviders', async ({ id, context }) => {
  await context.apiClient.qbert.deleteCloudProvider(id)
  return context.cloudProviders.filter(x => x.uuid !== id)
})

export const createCluster = async ({ data, context }) => {
  console.log('createCluster TODO')
  console.log(data)
}

export const attachNodesToCluster = contextUpdater('nodes', async ({ data, context }) => {
  const { clusterUuid, nodes } = data
  const nodeUuids = pluck('uuid', nodes)
  await context.apiClient.qbert.attach(clusterUuid, nodes)
  // Assign nodes to their clusters in the context as well so the user
  // can't add the same node to another cluster.
  return context.nodes.map(node =>
    nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid }) : node)
})

export const detachNodesFromCluster = contextUpdater('nodes', async ({ data, context, setContext }) => {
  const { clusterUuid, nodeUuids } = data
  await context.apiClient.qbert.detach(clusterUuid, nodeUuids)
  return context.nodes.map(node =>
    nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid: null }) : node)
})

export const scaleCluster = async ({ data, context }) => {
  const { cluster, numSpotWorkers, numWorkers, spotPrice } = data
  const body = {
    numWorkers,
    numSpotWorkers: numSpotWorkers || 0,
    spotPrice: spotPrice || 0.001,
    spotWorkerFlavor: cluster.cloudProperties.workerFlavor,
  }
  await context.apiClient.qbert.updateCluster(cluster.uuid, body)
}

const loadRawNodes = contextLoader('rawNodes', async ({ context }) => {
  const { qbert } = context.apiClient
  return qbert.getNodes()
})

export const loadClusters = contextLoader('clusters', async (params) => {
  const { context } = params
  const { qbert } = context.apiClient
  const [rawNodes, rawClusters, qbertEndpoint] = await Promise.all([
    loadRawNodes(params),
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

export const loadResMgrHosts = contextLoader('resmgrHosts', async ({ context }) => {
  const { resmgr } = context.apiClient
  return resmgr.getHosts()
})

export const loadCombinedHosts = contextLoader('combinedHosts', async params => {
  const [rawNodes, resmgrHosts] = await Promise.all([
    loadRawNodes(params),
    loadResMgrHosts(params),
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

export const loadNamespaces = contextLoader('namespaces', async params => {
  const { context } = params
  const { qbert } = context.apiClient
  const clusters = await loadClusters(params)
  const masterNodeClusters = clusters.filter(x => x.hasMasterNode)

  return asyncFlatMap(masterNodeClusters, cluster => qbert.getClusterNamespaces(cluster.uuid))
})

export const loadNodes = contextLoader('nodes', async params => {
  const [rawNodes, combinedHosts] = await Promise.all([
    loadRawNodes(params),
    loadCombinedHosts(params),
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
  )(context.serviceCatalog) || ''

  // associate nodes with the combinedHost entry
  return rawNodes.map(node => ({
    ...node,
    combined: combinedHostsObj[node.uuid],
    logs: `${qbertUrl}/logs/${node.uuid}`,
  }))
})
