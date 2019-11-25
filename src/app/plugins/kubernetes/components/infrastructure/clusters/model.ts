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
  lastOp: null
  lastOk: null
  keystoneEnabled: number
  authzEnabled: number
  taskStatus: string
  taskError: string
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
  nodePoolUuid: string
  nodePoolName: string
  cloudProviderUuid: string
  cloudProviderName: string
  cloudProviderType: CloudProviders
  cloudProperties: CloudProperties
  tags: Tags
  endpoint: string
  kubeconfigUrl: string
  isUpgrading: boolean
  nodes: any[]
  usage: Usage
  version: string
  masterNodes: any[]
  progressPercent: null
  healthyMasterNodes: any[]
  hasMasterNode: boolean
  highlyAvailable: boolean
  links: Links
  hasVpn: boolean
  hasLoadBalancer: boolean
}

enum CloudProviders {
  Aws = 'aws',
  Azure = 'azure',
  BareOS = 'bareos',
}

type CloudProperties = AzureCloudProperties | AwsCloudProperties

export interface AzureCloudProperties {
  location: string
  zones: string
  masterSku: string
  workerSku: string
  httpProxy: string
  sshKey: string
}

export interface AwsCloudProperties {
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

export interface Links {
  dashboard: null
  kubeconfig: null
  cli: null
}

export interface Tags {
  [key: string]: string
}

export interface Usage {
  compute: Metric
  memory: Metric
  disk: Metric
  grafanaLink?: string
}

export interface Metric {
  current: number
  max: number
  percent: number
}
