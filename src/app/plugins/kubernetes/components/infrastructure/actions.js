import { asyncMap, pathOrNull, pipeWhenTruthy, isTruthy } from 'app/utils/fp'
import {
  find, pathOr, pluck, prop, propEq, propSatisfies, compose, path, pipe, either,
} from 'ramda'
import { allKey } from 'app/constants'
import { castFuzzyBool } from 'utils/misc'
import { combineHost } from './combineHosts'
import { serviceCatalogContextKey } from 'openstack/components/api-access/actions'
import createContextLoader from 'core/helpers/createContextLoader'
import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { filterIf } from 'utils/fp'

export const clustersDataKey = 'clusters'
export const cloudProvidersDataKey = 'cloudProviders'
export const nodesDataKey = 'nodes'
export const rawNodesDataKey = 'rawNodes'
export const resMgrHostsDataKey = 'resMgrHosts'
export const combinedHostsDataKey = 'combinedHosts'

const { qbert, resmgr } = ApiClient.getInstance()

// eslint-disable-next-line
const loadRawNodes = createContextLoader(rawNodesDataKey, async () => {
  return qbert.getNodes()
}, { uniqueIdentifier: 'uuid' })

export const loadResMgrHosts = createContextLoader(resMgrHostsDataKey, async () => {
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
  const clusters = await loadFromContext(clustersDataKey, params)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) } = params
  return [clusterId, clusters]
}

export const clusterActions = createCRUDActions(clustersDataKey, {
  listFn: async (params, loadFromContext) => {
    const [rawNodes, rawClusters, qbertEndpoint] = await Promise.all([
      loadFromContext(rawNodesDataKey),
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
  },
  deleteFn: async ({ id }) => {
    await qbert.deleteCluster(id)
    // Refresh clusters since combinedHosts will still
    // have references to the deleted cluster.
    loadCombinedHosts.invalidateCache()
  },
  uniqueIdentifier: 'uuid',
  dataMapper: (items,
    { masterNodeClusters, masterlessClusters, hasControlPlane, appCatalogClusters, prometheusClusters }) => pipe(
    filterIf(masterNodeClusters, hasMasterNode),
    filterIf(masterlessClusters, masterlessCluster),
    filterIf(prometheusClusters, hasPrometheusEnabled),
    filterIf(appCatalogClusters, hasAppCatalogEnabled),
    filterIf(hasControlPlane, either(hasMasterNode, masterlessCluster))
  )(items),
  defaultOrderBy: 'name',
})

export const createCluster = async ({ data, context }) => {
  console.log('createCluster TODO')
  console.log(data)
}

export const cloudProviderActions = createCRUDActions(cloudProvidersDataKey, {
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
  uniqueIdentifier: 'uuid',
})

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

export const loadCombinedHosts = createContextLoader(combinedHostsDataKey, async (params,
  loadFromContext) => {
  const [rawNodes, resMgrHosts] = await Promise.all([
    loadFromContext(rawNodesDataKey),
    loadFromContext(resMgrHostsDataKey),
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
  uniqueIdentifier: 'uuid',
})

export const loadNodes = createContextLoader(nodesDataKey, async (params, loadFromContext) => {
  const [rawNodes, combinedHosts, serviceCatalog] = await Promise.all([
    loadFromContext(rawNodesDataKey),
    loadFromContext(combinedHostsDataKey),
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
}, {
  uniqueIdentifier: 'uuid',
})
