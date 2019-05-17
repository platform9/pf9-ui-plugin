import { asyncMap, pathOrNull, pipeWhenTruthy } from 'app/utils/fp'
import { find, pathOr, pluck, prop, propEq } from 'ramda'
import { castFuzzyBool } from 'utils/misc'
import { combineHost } from './combineHosts'
import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'

export const deleteCluster = contextUpdater('clusters', async ({ apiClient, currentItems, id }) => {
  await apiClient.qbert.deleteCluster(id)
  // Refresh clusters since combinedHosts will still
  // have references to the deleted cluster.
  return currentItems.filter(cluster => cluster.id === id)
})

export const loadCloudProviders = contextLoader('cloudProviders', async ({ apiClient: { qbert } }) => {
  return qbert.getCloudProviders()
})

export const createCloudProvider = ({ apiClient, data }) =>
  apiClient.qbert.createCloudProvider(data)

export const updateCloudProvider = ({ apiClient, id, data }) =>
  apiClient.qbert.updateCloudProvider(id, data)

export const deleteCloudProvider = contextUpdater('cloudProviders', async ({ apiClient: { qbert }, currentItems, id }) => {
  await qbert.deleteCloudProvider(id)
  return currentItems.filter(x => x.uuid !== id)
})

export const createCluster = async ({ data, context }) => {
  console.log('createCluster TODO')
  console.log(data)
}

export const attachNodesToCluster = contextUpdater('nodes', async ({ apiClient: { qbert }, currentItems, data }) => {
  const { clusterUuid, nodes } = data
  const nodeUuids = pluck('uuid', nodes)
  await qbert.attach(clusterUuid, nodes)
  // Assign nodes to their clusters in the context as well so the user
  // can't add the same node to another cluster.
  return currentItems.map(node => nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid }) : node)
})

export const detachNodesFromCluster = contextUpdater('nodes', async ({ apiClient: { qbert }, currentItems, data }) => {
  const { clusterUuid, nodeUuids } = data
  await qbert.detach(clusterUuid, nodeUuids)
  return currentItems.map(node =>
    nodeUuids.includes(node.uuid) ? ({ ...node, clusterUuid: null }) : node)
})

export const scaleCluster = async ({ context, data }) => {
  const { apiClient: { qbert } } = context
  const { cluster, numSpotWorkers, numWorkers, spotPrice } = data
  const body = {
    numWorkers,
    numSpotWorkers: numSpotWorkers || 0,
    spotPrice: spotPrice || 0.001,
    spotWorkerFlavor: cluster.cloudProperties.workerFlavor,
  }
  await qbert.updateCluster(cluster.uuid, body)
}

const loadRawNodes = contextLoader('rawNodes', async ({ apiClient: { qbert } }) => {
  return qbert.getNodes()
})

export const loadRawClusters = contextLoader('rawClusters', async ({ apiClient: { qbert } }) => {
  return qbert.getClusters()
})

export const loadQbertBaseUrl = contextLoader('qbertBaseUrl', async ({ apiClient: { qbert } }) => {
  return qbert.baseUrl()
})

export const loadClusters = contextLoader('clusters', async ({
  apiClient: { qbert },
  preloaded: { rawNodes, rawClusters, qbertEndpoint },
}) => {
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
}, {
  preload: {
    rawNodes: loadRawNodes,
    rawClusters: loadRawClusters,
    qbertEndpoint: loadQbertBaseUrl,
  },
})

export const loadResMgrHosts = contextLoader('resmgrHosts', async ({ apiClient: { resmgr } }) => {
  return resmgr.getHosts()
})

export const loadCombinedHosts = contextLoader('combinedHosts', async ({
  preloaded: { rawNodes, resmgrHosts },
}) => {
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
}, {
  preload: {
    rawNodes: loadRawNodes,
    resmgrHosts: loadResMgrHosts,
  },
})

export const loadNodes = contextLoader('nodes', async ({
  preloaded: {
    rawNodes,
    combinedHosts,
    serviceCatalog,
  },
}) => {
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
}, {
  preload: {
    rawNodes: loadRawNodes,
    combinedHosts: loadCombinedHosts,
    serviceCatalog: loadServiceCatalog,
  },
})
