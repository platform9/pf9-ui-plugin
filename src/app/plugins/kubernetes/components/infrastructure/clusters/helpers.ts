import ApiClient from 'api-client/ApiClient'
import { defaultMonitoringTag, onboardingMonitoringSetup } from 'app/constants'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'
import { isAdminRole } from 'k8s/util/helpers'
import { pathEq, pick, prop, propEq, propSatisfies } from 'ramda'
import { isTruthy, keyValueArrToObj, pathStrOr } from 'utils/fp'
import { sanitizeUrl } from 'utils/misc'
import { CloudProviders } from '../cloudProviders/model'
import { clockDriftDetectedInNodes } from '../nodes/helper'
import { hasConvergingNodes } from './ClusterStatusUtils'
import { NetworkStackTypes } from './constants'
import { CalicoDetectionTypes } from './form-components/calico-network-fields'
import { ClusterCreateTypes } from './model'
import { awsClusterTracking, azureClusterTracking, bareOSClusterTracking } from './tracking'

export const clusterIsHealthy = (cluster) =>
  cluster.status === 'ok' && cluster.masterNodesHealthStatus === 'healthy'

export const clusterNotBusy = (cluster) =>
  cluster.taskStatus === 'success' && !hasConvergingNodes(cluster.nodes)

export const isBareOsMultiMasterCluster = (cluster) =>
  cluster.cloudProviderType === CloudProviders.BareOS && !!cluster.masterVipIpv4

export const isAzureAutoscalingCluster = (cluster) =>
  cluster.cloudProviderType === CloudProviders.Azure && cluster.enableCAS

export const canScaleMasters = ([cluster]) =>
  isBareOsMultiMasterCluster(cluster) && clusterIsHealthy(cluster) && clusterNotBusy(cluster)

export const canScaleWorkers = ([cluster]) =>
  clusterNotBusy(cluster) && !isAzureAutoscalingCluster(cluster)

export const canUpgradeCluster = ([cluster]) =>
  !!cluster && cluster.canUpgrade && !clockDriftDetectedInNodes(cluster.nodes)

export const canDeleteCluster = ([cluster]) =>
  !['creating', 'deleting'].includes(cluster.taskStatus)

export const notBusy = ([cluster]) => cluster.taskStatus !== 'updating'

export const isAdmin = (selected, store) => isAdminRole(prop('session', store))

const { qbert } = ApiClient.getInstance()

export const getFormTitle = (title, target) => {
  if (target === ClusterCreateTypes.OneClick) {
    return `${title} Cluster`
  }
  return `Create a ${title} Cluster`
}

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
  const isNewDashboardUrl = parseInt(major) >= 1 && parseInt(minor) >= 16
  return `${qbertEndpoint}/${qbert.scopedEnpointPath()}/clusters/${
    cluster.uuid
  }/k8sapi/api/v1/namespaces/${
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

const getMetalLbCidr = (keyValueArr = []) =>
  keyValueArr.map(({ key, value }) => `${key}-${value}`).join()

const getCalicoDetectionMethod = ({ calicoDetectionMethod, calicoDetectionMethodValue }) => {
  if (calicoDetectionMethod === CalicoDetectionTypes.FirstFound) return calicoDetectionMethod

  return `${calicoDetectionMethod}=${calicoDetectionMethodValue}`
}

export const hasMasterNode = propSatisfies(isTruthy, 'hasMasterNode')
export const hasHealthyMasterNodes = propSatisfies(
  (healthyMasterNodes: any) => healthyMasterNodes.length > 0,
  'healthyMasterNodes',
)
export const masterlessCluster = propSatisfies(isTruthy, 'masterless')
export const hasPrometheusTag = pathEq(['hasPrometheus', 'pf9-system:monitoring'], 'true')
export const prometheusCluster = propSatisfies(isTruthy, 'hasPrometheus')
export const hasAppCatalogEnabled = propSatisfies(isTruthy, 'appCatalogEnabled')

export const createAwsCluster = async (data) => {
  const keysToPluck = [
    'name',
    'region',
    'azs',
    'ami',
    'sshKey',
    'masterFlavor',
    'workerFlavor',
    'numMasters',
    'enableCAS',
    'numWorkers',
    'allowWorkloadsOnMaster',
    'numSpotWorkers',
    'spotPrice',
    'vpc',
    'isPrivate',
    'privateSubnets',
    'subnets',
    'internalElb',
    'serviceFqdn',
    'containersCidr',
    'servicesCidr',
    'networkPlugin',
    'privileged',
    'appCatalogEnabled',
    'customAmi',
  ]

  const body = pick(keysToPluck, data)

  if (data.enableCAS) {
    body.numMinWorkers = data.numWorkers
    body.numMaxWorkers = data.numMaxWorkers
  }

  body.externalDnsName = data.usePf9Domain
    ? 'auto-generate'
    : sanitizeUrl(data.externalDnsName || '')
  body.serviceFqdn = data.usePf9Domain ? 'auto-generate' : sanitizeUrl(data.serviceFqdn || '')

  // TODO: Follow up with backend team to find out why platform9.net is not showing up in the
  // domain list and why we are hard-coding this id.
  body.domainId = data.usePf9Domain ? '/hostedzone/Z2LZB5ZNQY6JC2' : data.domainId

  // Set other fields based on what the user chose for 'networkOptions'
  if (['newPublicPrivate', 'existingPublicPrivate', 'existingPrivate'].includes(data.network)) {
    body.isPrivate = true
  }
  if (data.network === 'existingPrivate') {
    body.internalElb = true
  }

  const cluster = createGenericCluster(body, data)

  // Placed beneath API call -- send the tracking when the request is successful
  awsClusterTracking.createFinished(data.segmentTrackingFields)(data)

  return cluster
}

export const createAzureCluster = async (data) => {
  const keysToPluck = [
    'name',
    'location',
    'zones',
    'sshKey',
    'masterSku',
    'workerSku',
    'numMasters',
    'numWorkers',
    'allowWorkloadsOnMaster',
    'enableCAS',
    'assignPublicIps',
    'vnetResourceGroup',
    'vnetName',
    'masterSubnetName',
    'workerSubnetName',
    'externalDnsName',
    'serviceFqdn',
    'containersCidr',
    'servicesCidr',
    'networkPlugin',
    'privileged',
    'appCatalogEnabled',
  ]

  const body = pick(keysToPluck, data)

  if (data.enableCAS) {
    body.numMinWorkers = data.numWorkers
    body.numMaxWorkers = data.numMaxWorkers
  }

  if (data.useAllAvailabilityZones) {
    body.zones = []
  }
  const cluster = createGenericCluster(body, data)

  // Placed beneath API call -- send the tracking when the request is successful
  azureClusterTracking.createFinished(data.segmentTrackingFields)(data)

  return cluster
}

export const createBareOSCluster = async (data) => {
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
    'deployKubevirt',
    'deployLuigiOperator',
    'useHostname',
  ]

  const body = pick(keysToPluck, data)

  if (data.enableMetallb) {
    body.enableMetallb = data.enableMetallb
    body.metallbCidr = getMetalLbCidr(data.metallbCidr)
  }

  // 1. Get the nodePoolUuid from the nodePools API and look for the pool with name 'defaultPool'
  const nodePools = await qbert.getNodePools()
  body.nodePoolUuid = nodePools.find((x) => x.name === 'defaultPool').uuid

  // 2. Create the cluster
  const cluster = await createGenericCluster(body, data)

  // Placed beneath API call -- send the tracking when the request is successful
  bareOSClusterTracking.createFinished(data.segmentTrackingFields)(data)

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

  if (data.kubeRoleVersion) {
    body.kubeRoleVersion = data.kubeRoleVersion
  }

  if (data.apiServerFlags) {
    body.apiServerFlags = data.apiServerFlags?.split(',')
  }

  if (data.controllerManagerFlags) {
    body.controllerManagerFlags = data.controllerManagerFlags?.split(',')
  }

  if (data.schedulerFlags) {
    body.schedulerFlags = data.schedulerFlags?.split(',')
  }

  // Calico is required when ipv6 is selected
  if (data.networkStack === NetworkStackTypes.IPv6) {
    body.calicoIPv6PoolCidr = body.containersCidr
    body.ipv6 = true
    body.calicoIPv6DetectionMethod = getCalicoDetectionMethod(data)
    body.calicoIPv6PoolBlockSize = data.calicoBlockSize
    body.calicoIPv6PoolNatOutgoing = data.calicoNatOutgoing
  }

  if (data.networkPlugin === 'calico') {
    body.mtuSize = data.mtuSize
    body.calicoIpIpMode = data.calicoIpIpMode

    if (data.networkStack === NetworkStackTypes.IPv4) {
      body.calicoNatOutgoing = data.calicoNatOutgoing
      body.calicoV4BlockSize = data.calicoBlockSize
      body.calicoIPv4DetectionMethod = getCalicoDetectionMethod(data)
    }
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
  body.tags = keyValueArrToObj(tags.concat(data.tags || []))

  const createResponse = await qbert.createCluster(body)
  const uuid = createResponse.uuid

  if (data.prometheusMonitoringEnabled) {
    localStorage.setItem(onboardingMonitoringSetup, 'true')
  }

  // The POST call only returns the `uuid` and that's it.
  // We need to perform a GET afterwards and return that to add to the cache.
  return qbert.getClusterDetails(uuid)
}
