import ApiClient from 'api-client/ApiClient'
import { defaultMonitoringTag, onboardingMonitoringSetup } from 'app/constants'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'
import { compose, path, pick, propEq, propSatisfies } from 'ramda'
import { isTruthy, keyValueArrToObj, pathStrOr } from 'utils/fp'
import { castFuzzyBool, sanitizeUrl } from 'utils/misc'
import { trackEvent } from 'utils/tracking'

const { qbert } = ApiClient.getInstance()

export const getProgressPercent = async (clusterId) => {
  try {
    const { progressPercent } = await qbert.getClusterDetails(clusterId)
    return progressPercent
  } catch (e) {
    console.warn(e)
    return null
  }
}

export const getKubernetesVersion = async (clusterId) => {
  try {
    const version = await qbert.getKubernetesVersion(clusterId)
    return version && version.gitVersion && version.gitVersion.substr(1)
  } catch (e) {
    console.warn(e)
    return null
  }
}
export const getK8sDashboardLinkFromVersion = (version, qbertEndpoint, cluster) => {
  const matches = /(?<major>\d+).(?<minor>\d+).(?<patch>\d+)/.exec(version)
  if (!version || !matches) {
    return null
  }
  const { major, minor } = matches.groups || {}
  const isNewDashboardUrl = major >= 1 && minor >= 16
  return `${qbertEndpoint}/clusters/${cluster.uuid}/k8sapi/api/v1/namespaces/${
    isNewDashboardUrl ? 'kubernetes-dashboard' : 'kube-system'
  }/services/https:kubernetes-dashboard:443/proxy/`
}

export const getEtcdBackupPayload = (path, data) =>
  pathStrOr(0, path, data)
    ? {
        storageType: 'local',
        isEtcdBackupEnabled: 1,
        storageProperties: {
          localPath: data.etcdStoragePath,
        },
        intervalInMins: data.etcdBackupInterval,
      }
    : {
        isEtcdBackupEnabled: 0,
      }

export const hasMasterNode = propSatisfies(isTruthy, 'hasMasterNode')
export const hasHealthyMasterNodes = propSatisfies(
  (healthyMasterNodes) => healthyMasterNodes.length > 0,
  'healthyMasterNodes',
)
export const masterlessCluster = propSatisfies(isTruthy, 'masterless')
export const hasPrometheusTag = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))
export const hasAppCatalogEnabled = propSatisfies(isTruthy, 'appCatalogEnabled')

export const createAwsCluster = async (data) => {
  const { domainId, usePf9Domain } = data
  const body = {
    // basic info
    ...pick('name region azs ami sshKey'.split(' '), data),
    // cluster configuration
    ...pick(
      (
        'masterFlavor workerFlavor numMasters enableCAS numWorkers allowWorkloadsOnMaster ' +
        'numSpotWorkers spotPrice'
      ).split(' '),
      data,
    ),

    // network info
    ...pick(
      (
        'vpc isPrivate privateSubnets subnets internalElb serviceFqdn containersCidr ' +
        'servicesCidr networkPlugin'
      ).split(' '),
      data,
    ),

    // advanced configuration
    ...pick('privileged appCatalogEnabled customAmi'.split(' '), data),
  }

  if (data.enableCAS) {
    body.numMinWorkers = data.numWorkers
    body.numMaxWorkers = data.numMaxWorkers
  }

  body.externalDnsName = usePf9Domain ? 'auto-generate' : sanitizeUrl(data.externalDnsName)
  body.serviceFqdn = usePf9Domain ? 'auto-generate' : sanitizeUrl(data.serviceFqdn)

  // TODO: Follow up with backend team to find out why platform9.net is not showing up in the
  // domain list and why we are hard-coding this id.
  body.domainId = usePf9Domain ? '/hostedzone/Z2LZB5ZNQY6JC2' : domainId

  // Set other fields based on what the user chose for 'networkOptions'
  if (['newPublicPrivate', 'existingPublicPrivate', 'existingPrivate'].includes(data.network)) {
    body.isPrivate = true
  }
  if (data.network === 'existingPrivate') {
    body.internalElb = true
  }

  const cluster = createGenericCluster(body, data)

  // Placed beneath API call -- send the tracking when the request is successful
  trackEvent('WZ New AWS Cluster Finished', {
    cluster_name: data.name,
  })

  return cluster
}

export const createAzureCluster = async (data) => {
  const body = {
    // basic info
    ...pick('name location zones sshKey'.split(' '), data),

    // cluster configuration
    ...pick('masterSku workerSku numMasters numWorkers allowWorkloadsOnMaster'.split(' '), data),

    // network info
    ...pick(
      'assignPublicIps vnetResourceGroup vnetName masterSubnetName workerSubnetName ' +
        'externalDnsName serviceFqdn containersCidr servicesCidr networkPlugin'.split(' '),
      data,
    ),

    // advanced configuration
    ...pick('privileged appCatalogEnabled'.split(' '), data),
  }

  if (data.useAllAvailabilityZones) {
    body.zones = []
  }

  const cluster = createGenericCluster(body, data)

  // Placed beneath API call -- send the tracking when the request is successful
  trackEvent('WZ New Azure Cluster Finished', {
    cluster_name: data.name,
  })

  return cluster
}

export const createBareOSCluster = async (data = {}) => {
  const keysToPluck = [
    'name',
    'masterNodes',
    'allowWorkloadsOnMaster',
    'workerNodes',
    'masterVipIpv4',
    'masterVipIface',
    'externalDnsName',
    'containersCidr',
    'servicesCidr',
    'mtuSize',
    'privileged',
    'appCatalogEnabled',
  ]
  const body = pick(keysToPluck, data)

  if (data.enableMetallb) {
    body.enableMetallb = data.enableMetallb
    body.metallbCidr = data.metallbCidr
  }

  // 1. Get the nodePoolUuid from the nodePools API and look for the pool with name 'defaultPool'
  const nodePools = await qbert.getNodePools()
  body.nodePoolUuid = nodePools.find((x) => x.name === 'defaultPool').uuid

  // 2. Create the cluster
  const cluster = await createGenericCluster(body, data)

  // Placed beneath API call -- send the tracking when the request is successful
  trackEvent('WZ New BareOS Cluster Finished', {
    cluster_name: data.name,
  })

  // 3. Attach the nodes
  const { masterNodes, workerNodes = [] } = data
  const nodes = [
    ...masterNodes.map((uuid) => ({ isMaster: true, uuid })),
    ...workerNodes.map((uuid) => ({ isMaster: false, uuid })),
  ]

  await qbert.attach(cluster.uuid, nodes)

  return cluster
}

const createGenericCluster = async (body, data) => {
  const { cloudProviderId } = data

  if (!body.nodePoolUuid && !!cloudProviderId) {
    // Get the nodePoolUuid from the cloudProviderId.
    // There is a 1-to-1 mapping between cloudProviderId and nodePoolUuuid right now.
    const cloudProviders = await cloudProviderActions.list()
    body.nodePoolUuid = cloudProviders.find(propEq('uuid', cloudProviderId)).nodePoolUuid
  }

  if (data.httpProxy) {
    body.httpProxy = data.httpProxy
  }
  if (data.networkPlugin === 'calico') {
    body.mtuSize = data.mtuSize
    body.calicoIpIpMode = data.calicoIpIpMode
    body.calicoNatOutgoing = data.calicoNatOutgoing
    body.calicoV4BlockSize = data.calicoV4BlockSize
  }
  body.networkPlugin = data.networkPlugin
  body.runtimeConfig = {
    default: '',
    all: 'api/all=true',
    custom: data.customRuntimeConfig,
  }[data.runtimeConfigOption]

  // This is currently supported by all cloud providers except GCP (which we
  // don't have yet anyways)
  body.etcdBackup = getEtcdBackupPayload('etcdBackup', data)

  const tags = data.prometheusMonitoringEnabled ? [defaultMonitoringTag] : []
  body.tags = keyValueArrToObj(tags.concat(data.tags))

  const createResponse = await qbert.createCluster(body)
  const uuid = createResponse.uuid

  if (data.prometheusMonitoringEnabled) {
    localStorage.setItem(onboardingMonitoringSetup, true)
  }

  // The POST call only returns the `uuid` and that's it.
  // We need to perform a GET afterwards and return that to add to the cache.
  return qbert.getClusterDetails(uuid)
}
