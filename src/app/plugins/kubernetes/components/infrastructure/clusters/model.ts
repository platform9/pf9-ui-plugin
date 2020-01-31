import { ICombinedNode } from '../nodes/model'

export type HealthStatus = 'healthy' | 'partially_healthy' | 'unhealthy' | 'unknown'

export interface ICluster {
  name: string
  uuid: string
  canUpgrade: boolean
  containersCidr: string
  created_at: string
  servicesCidr: string
  isKubernetes: number
  isSwarm: number
  isMesos: number
  masterIp: string
  externalDnsName: string
  debug: string
  status: string
  flannelIfaceLabel: string
  flannelPublicIfaceLabel: string
  dockerRoot: string
  etcdDataDir: string
  lastOp: string | null
  lastOk: null
  keystoneEnabled: number
  authzEnabled: number
  taskStatus: string
  taskError: string | null
  numMasters: number
  numWorkers: number
  privileged: boolean
  appCatalogEnabled: boolean
  projectId: string
  runtimeConfig: string
  networkPlugin: string
  allowWorkloadsOnMaster: boolean
  enableMetallb: number
  metallbCidr: string
  masterVipIpv4: string
  masterVipVrouterId: string
  masterVipIface: string
  k8sApiPort: string
  mtuSize: string
  masterless: number
  etcdVersion: string
  apiserverStorageBackend: string
  enableCAS: number
  numMinWorkers: number
  numMaxWorkers: number
  etcdHeartbeatIntervalMs: string
  etcdElectionTimeoutMs: string
  masterStatus: string
  workerStatus: string
  nodePoolUuid: string
  nodePoolName: string
  cloudProviderUuid: string
  cloudProviderName: string
  cloudProviderType: CloudProviders
  cloudProperties: CloudProperties
  tags: Tags
  etcdBackup: EtcdBackup
  endpoint: string
  kubeconfigUrl: string
  isUpgrading: boolean
  nodes: ICombinedNode[]
  usage: Usage
  version: string
  masterNodes: ICombinedNode[]
  workerNodes: ICombinedNode[]
  progressPercent: null
  healthyMasterNodes: any[]
  healthyWorkerNodes: any[]
  masterNodesHealthStatus: HealthStatus
  workerNodesHealthStatus: HealthStatus
  connectionStatus: string
  healthStatus: string
  hasMasterNode: boolean
  highlyAvailable: boolean
  links: Links
  hasVpn: boolean
  hasLoadBalancer: boolean
  etcdBackupEnabled: boolean
}

export enum CloudProviders {
  Aws = 'aws',
  Azure = 'azure',
  BareOS = 'local',
}
export enum CloudProvidersFriendlyName {
  aws = 'AWS',
  azure = 'Azure',
  local = 'BareOS',
}

type CloudProperties = AzureCloudProperties | AwsCloudProperties | BareOSCloudProperties

interface AzureCloudProperties {
  location: string
  zones: string
  masterSku: string
  workerSku: string
  httpProxy: string
  sshKey: string
}

interface AwsCloudProperties {
  region: string
  masterFlavor: string
  workerFlavor: string
  sshKey: string
  serviceFqdn: string
  ami: string
  domainId: string
  isPrivate: string
  usePf9Domain: string
  internalElb: string
  azs: string
  numSpotWorkers: string
  spotWorkerFlavor: string
  spotPrice: string
}

interface BareOSCloudProperties {
  masterNodes: string
  statusOfMasters: string
  statusOfWorkers: string
}

interface EtcdBackup {
  storageProperties: EtcdBackupStorageProperties
  intervalInMins: string
}
interface EtcdBackupStorageProperties {
  localPath: string
}
interface Links {
  dashboard: null
  kubeconfig: null
  cli: null
}

interface Tags {
  [key: string]: string
}

interface Usage {
  compute: Metric
  memory: Metric
  disk: Metric
  grafanaLink?: string
}

interface Metric {
  current: number
  max: number
  percent: number
}
