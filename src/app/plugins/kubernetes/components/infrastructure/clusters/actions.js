import ApiClient from 'api-client/ApiClient'
import calcUsageTotals from 'k8s/util/calcUsageTotals'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { allKey, defaultMonitoringTag } from 'app/constants'
import { castFuzzyBool, sanitizeUrl } from 'utils/misc'
import {
  clustersCacheKey, combinedHostsCacheKey, loadCombinedHosts,
} from 'k8s/components/infrastructure/common/actions'
import { filterIf, isTruthy, updateWith, adjustWith, keyValueArrToObj } from 'utils/fp'
import { mapAsync } from 'utils/async'
import {
  pluck, pathOr, pick, pipe, either, propSatisfies, compose, path, propEq, mergeLeft, partition,
} from 'ramda'
import { rawNodesCacheKey } from 'k8s/components/infrastructure/nodes/actions'
import {
  getMasterNodesHealthStatus,
  getWorkerNodesHealthStatus,
  getConnectionStatus,
  getHealthStatus,
} from './ClusterStatusUtils'
import { trackEvent } from 'utils/tracking'

const { qbert } = ApiClient.getInstance()

const trackClusterCreation = (params) => {
  trackEvent('WZ New Cluster Finished', params)
}

const getProgressPercent = async clusterId => {
  try {
    const { progressPercent } = await qbert.getClusterDetails(clusterId)
    return progressPercent
  } catch (e) {
    console.warn(e)
    return null
  }
}
const getKubernetesVersion = async clusterId => {
  try {
    const version = await qbert.getKubernetesVersion(clusterId)
    return version && version.gitVersion && version.gitVersion.substr(1)
  } catch (e) {
    console.warn(e)
    return null
  }
}

const getEtcdBackupPayload = (data) => (
  data.etcdBackup ? {
    isEtcdBackupEnabled: 1,
    storageType: 'local',
    storageProperties: {
      localPath: data.etcdStoragePath,
    },
    intervalInMins: data.etcdBackupInterval,
  } : {
    isEtcdBackupEnabled: 0,
  }
)

export const hasMasterNode = propSatisfies(isTruthy, 'hasMasterNode')
export const hasHealthyMasterNodes = propSatisfies(
  healthyMasterNodes => healthyMasterNodes.length > 0, 'healthyMasterNodes')
export const masterlessCluster = propSatisfies(isTruthy, 'masterless')
export const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))
export const hasAppCatalogEnabled = propSatisfies(isTruthy, 'appCatalogEnabled')

const createAwsCluster = async (data, loadFromContext) => {
  const { domainId, usePf9Domain } = data
  const body = {
    // basic info
    ...pick('name region azs ami sshKey'.split(' '), data),
    // cluster configuration
    ...pick('masterFlavor workerFlavor numMasters enableCAS numWorkers allowWorkloadsOnMaster numSpotWorkers spotPrice'.split(' '), data),

    // network info
    ...pick('vpc isPrivate privateSubnets subnets internalElb serviceFqdn containersCidr servicesCidr networkPlugin'.split(' '), data),

    // advanced configuration
    ...pick('privileged appCatalogEnabled customAmi'.split(' '), data),
  }

  if (data.enableCAS) {
    body.numMinWorkers = data.numWorkers
    body.numMaxWorkers = data.numMaxWorkers
  }

  body.externalDnsName = usePf9Domain ? 'auto-generate' : sanitizeUrl(data.externalDnsName)
  body.serviceFqdn = usePf9Domain ? 'auto-generate' : sanitizeUrl(data.serviceFqdn)

  // Follow up with backend team to find out why platform9.net is not showing up in the domain list and why we are hard-coding this id.
  body.domainId = usePf9Domain ? '/hostedzone/Z2LZB5ZNQY6JC2' : domainId

  // Set other fields based on what the user chose for 'networkOptions'
  if (['newPublicPrivate', 'existingPublicPrivate', 'existingPrivate'].includes(data.network)) { body.isPrivate = true }
  if (data.network === 'existingPrivate') { body.internalElb = true }

  const cluster = createGenericCluster(body, data, loadFromContext)

  // Placed beneath API call -- send the tracking when the request is successful
  trackClusterCreation({
    clusterType: 'aws',
    clusterName: data.name,
  })

  return cluster
}

const createAzureCluster = async (data, loadFromContext) => {
  const body = {
    // basic info
    ...pick('name location zones sshKey'.split(' '), data),

    // cluster configuration
    ...pick('masterSku workerSku numMasters numWorkers allowWorkloadsOnMaster'.split(' '), data),

    // network info
    ...pick('assignPublicIps vnetResourceGroup vnetName masterSubnetName workerSubnetName externalDnsName serviceFqdn containersCidr servicesCidr networkPlugin'.split(' '), data),

    // advanced configuration
    ...pick('privileged appCatalogEnabled'.split(' '), data),
  }

  if (data.useAllAvailabilityZones) { body.zones = [] }

  const cluster = createGenericCluster(body, data, loadFromContext)

  // Placed beneath API call -- send the tracking when the request is successful
  trackClusterCreation({
    clusterType: 'aws',
    clusterName: data.name,
  })

  return cluster
}

const createBareOSCluster = async (data = {}, loadFromContext) => {
  const keysToPluck = [
    'name',
    'masterNodes',
    'allowWorkloadsOnMaster',
    'workerNodes',
    'masterVipIpv4',
    'masterVipIface',
    'metallbCidr',
    'externalDnsName',
    'containersCidr',
    'servicesCidr',
    'mtuSize',
    'privileged',
    'appCatalogEnabled',
  ]
  const body = pick(keysToPluck, data)

  if (data.enableMetallb) {
    body.metallbCidr = data.metallbCidr
  }

  // 1. Get the nodePoolUuid from the nodePools API and look for the pool with name 'defaultPool'
  const nodePools = await qbert.getNodePools()
  body.nodePoolUuid = nodePools.find(x => x.name === 'defaultPool').uuid

  // 2. Create the cluster
  const cluster = await createGenericCluster(body, data, loadFromContext)

  // Placed beneath API call -- send the tracking when the request is successful
  trackClusterCreation({
    clusterType: 'local',
    clusterName: data.name,
  })

  // 3. Attach the nodes
  const { masterNodes, workerNodes = [] } = data
  const nodes = [
    ...masterNodes.map(uuid => ({ isMaster: true, uuid })),
    ...workerNodes.map(uuid => ({ isMaster: false, uuid })),
  ]

  await qbert.attach(cluster.uuid, nodes)

  return cluster
}

const createGenericCluster = async (body, data, loadFromContext) => {
  const { cloudProviderId } = data

  if (!body.nodePoolUuid && !!cloudProviderId) {
    // Get the nodePoolUuid from the cloudProviderId.  There is a 1-to-1 mapping between cloudProviderId and nodePoolUuuid right now.
    const cloudProviders = await loadFromContext('cloudProviders')
    body.nodePoolUuid = cloudProviders.find(propEq('uuid', cloudProviderId)).nodePoolUuid
  }

  if (data.httpProxy) { body.httpProxy = data.httpProxy }
  if (data.networkPlugin === 'calico') { body.mtuSize = data.mtuSize }
  body.runtimeConfig = {
    default: '',
    all: 'api/all=true',
    custom: data.customRuntimeConfig,
  }[data.runtimeConfigOption]

  // This is currently supported by all cloud providers except GCP (which we
  // don't have yet anyways)
  body.etcdBackup = getEtcdBackupPayload(data)

  const tags = data.prometheusMonitoringEnabled ? [defaultMonitoringTag] : []
  body.tags = keyValueArrToObj([tags].concat(data.tags))

  const createResponse = await qbert.createCluster(body)
  const uuid = createResponse.uuid

  // The POST call only returns the `uuid` and that's it.  We need to perform a GET afterwards and return that to add to the cache.
  return qbert.getClusterDetails(uuid)
}

export const clusterActions = createCRUDActions(clustersCacheKey, {
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
      const dashboardLink = `${qbertEndpoint}/clusters/${cluster.uuid}/k8sapi/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:443/proxy/`
      const host = qbertEndpoint.match(/(.*?)\/qbert/)[1]
      const grafanaLink = `${host}/k8s/v1/clusters/${cluster.uuid}/k8sapi/api/v1/namespaces/pf9-monitoring/services/http:grafana-ui:80/proxy/`
      const usage = {
        compute: calcNodesTotals('usage.compute.current', 'usage.compute.max'),
        memory: calcNodesTotals('usage.memory.current', 'usage.memory.max'),
        disk: calcNodesTotals('usage.disk.current', 'usage.disk.max'),
        grafanaLink: hasPrometheusEnabled(cluster) ? grafanaLink : null,
      }
      const isMasterNode = node => node.isMaster === 1
      const [masterNodes, workerNodes] = partition(isMasterNode, nodesInCluster)
      const healthyMasterNodes = masterNodes.filter(node => node.status === 'ok')
      const healthyWorkerNodes = workerNodes.filter(node => node.status === 'ok')
      const masterNodesHealthStatus = getMasterNodesHealthStatus(masterNodes, healthyMasterNodes)
      const workerNodesHealthStatus = getWorkerNodesHealthStatus(workerNodes, healthyWorkerNodes)
      const connectionStatus = getConnectionStatus(cluster.taskStatus, nodesInCluster)
      const healthStatus = getHealthStatus(connectionStatus, masterNodesHealthStatus, workerNodesHealthStatus)
      const hasMasterNode = healthyMasterNodes.length > 0
      const clusterOk = nodesInCluster.length > 0 && cluster.status === 'ok'
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
        workerNodes,
        progressPercent,
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
        hasLoadBalancer: castFuzzyBool(cluster.enableMetallb || pathOr(false, ['cloudProperties', 'enableLbaas'], cluster)),
        etcdBackupEnabled: castFuzzyBool(pathOr(false, ['etcdBackup', 'isEtcdBackupEnabled'], cluster)),
      }
    }, rawClusters)
  },
  createFn: (params, _, loadFromContext) => {
    if (params.clusterType === 'aws') { return createAwsCluster(params, loadFromContext) }
    if (params.clusterType === 'azure') { return createAzureCluster(params, loadFromContext) }
    if (params.clusterType === 'local') { return createBareOSCluster(params, loadFromContext) }
  },
  updateFn: async ({ uuid, ...params }) => {
    const updateableParams = 'name tags numWorkers numMinWorkers numMaxWorkers'.split(' ')
    const body = pick(updateableParams, params)

    // This is currently supported by all cloud providers except GCP (which we
    // don't have yet anyways)
    body.etcdBackup = getEtcdBackupPayload(params)

    await qbert.updateCluster(uuid, body)
    // Doing this will help update the table, but the cache remains incorrect...
    // Same issue regarding cache applies to anything else updated this function
    // body.etcdBackupEnabled = !!body.etcdBackup
    clusterActions.invalidateCache()
    return body
  },
  deleteFn: async ({ uuid }) => {
    await qbert.deleteCluster(uuid)
    // Refresh clusters since combinedHosts will still
    // have references to the deleted cluster.
    loadCombinedHosts.invalidateCache()
  },
  customOperations: {
    scaleCluster: async ({ cluster, numSpotWorkers, numWorkers, spotPrice }, prevItems) => {
      const body = {
        numWorkers,
        numSpotWorkers: numSpotWorkers || 0,
        spotPrice: spotPrice || 0.001,
        spotWorkerFlavor: cluster.cloudProperties.workerFlavor,
      }
      await qbert.updateCluster(cluster.uuid, body)

      // Update the cluster in the cache
      return updateWith(propEq('uuid', cluster.uuid), {
        ...cluster,
        numWorkers,
      }, prevItems)
    },
    upgradeCluster: async ({ uuid }, prevItems) => {
      await qbert.upgradeCluster(uuid)

      // Update the cluster in the cache
      return adjustWith(propEq('uuid', uuid), mergeLeft({
        canUpgrade: false,
      }), prevItems)
    },
    updateTag: async ({ cluster, key, val }, prevItems) => {
      const body = {
        tags: { ...cluster.tags || {}, [key]: val }
      }

      await qbert.updateCluster(cluster.uuid, body)

      return updateWith(propEq('uuid', cluster.uuid), {
        ...cluster,
        ...body,
      }, prevItems)
    },
    attachNodes: async ({ cluster, nodes }, prevItems) => {
      await qbert.attach(cluster.uuid, nodes)
      loadCombinedHosts.invalidateCache()
      return prevItems
    },
    detachNodes: async ({ cluster, nodes }, prevItems) => {
      await qbert.detach(cluster.uuid, nodes)
      loadCombinedHosts.invalidateCache()
      return prevItems
    },
  },
  uniqueIdentifier: 'uuid',
  dataMapper: (items,
    { masterNodeClusters, masterlessClusters, hasControlPanel, healthyClusters, appCatalogClusters, prometheusClusters }) => pipe(
    filterIf(masterNodeClusters, hasMasterNode),
    filterIf(masterlessClusters, masterlessCluster),
    filterIf(prometheusClusters, hasPrometheusEnabled),
    filterIf(appCatalogClusters, hasAppCatalogEnabled),
    filterIf(hasControlPanel, either(hasMasterNode, masterlessCluster)),
    filterIf(healthyClusters, hasHealthyMasterNodes),
  )(items),
  defaultOrderBy: 'created_at',
  defaultOrderDirection: 'desc',
})

// If params.clusterId is not assigned it fetches all clusters and extracts the clusterId from the first cluster
// It also adds a "clusters" param that contains all the clusters, just for convenience
export const parseClusterParams = async (params, loadFromContext) => {
  const clusters = await loadFromContext(clustersCacheKey, params)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) } = params
  return [clusterId, clusters]
}
