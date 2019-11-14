import ApiClient from 'api-client/ApiClient'
import calcUsageTotals from 'k8s/util/calcUsageTotals'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { allKey } from 'app/constants'
import { castFuzzyBool, sanitizeUrl } from 'utils/misc'
import { clustersCacheKey, combinedHostsCacheKey, loadCombinedHosts } from 'k8s/components/infrastructure/common/actions'
import { filterIf, isTruthy, updateWith } from 'utils/fp'
import { mapAsync } from 'utils/async'
import { pluck, pathOr, pick, pipe, either, propSatisfies, compose, path, propEq } from 'ramda'
import { rawNodesCacheKey } from 'k8s/components/infrastructure/nodes/actions'

const { qbert } = ApiClient.getInstance()

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

export const hasMasterNode = propSatisfies(isTruthy, 'hasMasterNode')
export const hasHealthyMasterNodes = propSatisfies(healthyMasterNodes => healthyMasterNodes.length > 0, 'healthyMasterNodes')
export const masterlessCluster = propSatisfies(isTruthy, 'masterless')
export const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))
export const hasAppCatalogEnabled = propSatisfies(isTruthy, 'appCatalogEnabled')

const createAwsCluster = async (data, loadFromContext) => {
  const { cloudProviderId, domainId, usePf9Domain } = data
  const body = {
    // basic info
    ...pick('name region azs ami sshKey'.split(' '), data),
    // cluster configuration
    ...pick('masterFlavor workerFlavor numMasters enableCAS numWorkers numMaxWorkers allowWorkloadsOnMaster numSpotWorkers spotPrice'.split(' '), data),

    // network info
    ...pick('domainId vpc isPrivate privateSubnets subnets internalElb externalDnsName serviceFqdn containersCidr servicesCidr networkPlugin'.split(' '), data),

    // advanced configuration
    ...pick('privileged appCatalogEnabled customAmi tags'.split(' '), data),
  }
  if (data.httpProxy) { body.httpProxy = data.httpProxy }
  if (data.networkPlugin === 'calico') { body.mtuSize = data.mtuSize }

  body.externalDnsName = usePf9Domain ? 'auto-generate' : sanitizeUrl(data.externalDnsName)
  body.serviceFqdn = usePf9Domain ? 'auto-generate' : sanitizeUrl(data.serviceFqdn)

  // Follow up with backend team to find out why platform9.net is not showing up in the domain list and why we are hard-coding this id.
  body.domainId = usePf9Domain ? '/hostedzone/Z2LZB5ZNQY6JC2' : domainId

  // Get the nodePoolUuid from the cloudProviderId.  There is a 1-to-1 mapping between cloudProviderId and nodePoolUuuid right now.
  const cloudProviders = await loadFromContext('cloudProviders')
  body.nodePoolUuid = cloudProviders.find(propEq('uuid', cloudProviderId)).nodePoolUuid

  data.runtimeConfig = {
    default: '',
    all: 'api/all=true',
    custom: data.customRuntimeConfig,
  }[data.runtimeConfigOption]

  // Set other fields based on what the user chose for 'networkOptions'
  if (['newPublicPrivate', 'existingPublicPrivate', 'existingPrivate'].includes(data.network)) { body.isPrivate = true }
  if (data.network === 'existingPrivate') { body.internalElb = true }

  const response = await qbert.createCluster(body)
  return response
}

const createAzureCluster = async (data, loadFromContext) => {
  const { cloudProviderId } = data
  const body = {
    // basic info
    ...pick('name location zones sshKey'.split(' '), data),

    // cluster configuration
    ...pick('masterSku workerSku numMasters numWorkers allowWorkloadsOnMaster'.split(' '), data),

    // network info
    ...pick('assignPublicIps vnetResourceGroup vnetName masterSubnetName workerSubnetName externalDnsName serviceFqdn containersCidr servicesCidr networkPlugin'.split(' '), data),

    // advanced configuration
    ...pick('privileged appCatalogEnabled tags'.split(' '), data),
  }
  // Get the nodePoolUuid from the cloudProviderId.  There is a 1-to-1 mapping between cloudProviderId and nodePoolUuuid right now.
  const cloudProviders = await loadFromContext('cloudProviders')
  body.nodePoolUuid = cloudProviders.find(propEq('uuid', cloudProviderId)).nodePoolUuid

  if (data.useAllAvailabilityZones) { body.zones = [] }
  if (data.httpProxy) { body.httpProxy = data.httpProxy }
  if (data.networkPlugin === 'calico') { body.mtuSize = data.mtuSize }

  data.runtimeConfig = {
    default: '',
    all: 'api/all=true',
    custom: data.customRuntimeConfig,
  }[data.runtimeConfigOption]

  const response = await qbert.createCluster(body)
  return response
}

export const clusterActions = createCRUDActions(clustersCacheKey, {
  createFn: (params, _, loadFromContext) => {
    if (params.clusterType === 'aws') { return createAwsCluster(params, loadFromContext) }
    if (params.clusterType === 'azure') { return createAzureCluster(params, loadFromContext) }
  },

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
      const masterNodes = nodesInCluster.filter(node => node.isMaster === 1)
      const healthyMasterNodes = masterNodes.filter(
        node => node.status === 'ok' && node.api_responding === 1)
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
  defaultOrderBy: 'name',
})

// If params.clusterId is not assigned it fetches all clusters and extracts the clusterId from the first cluster
// It also adds a "clusters" param that contains all the clusters, just for convenience
export const parseClusterParams = async (params, loadFromContext) => {
  const clusters = await loadFromContext(clustersCacheKey, params)
  const { clusterId = pathOr(allKey, [0, 'uuid'], clusters) } = params
  return [clusterId, clusters]
}
