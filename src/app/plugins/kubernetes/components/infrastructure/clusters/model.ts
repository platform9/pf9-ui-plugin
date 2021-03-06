import { ClusterElement, INormalizedCluster } from 'api-client/qbert.model'
import { Pkg } from 'api-client/appbert.model'
import { INodesSelector } from '../nodes/model'

export enum ClusterCreateTypes {
  OneClick = 'one-click',
  Custom = 'custom',
  SingleMaster = 'single-master',
  MultiMaster = 'multi-master',
}

export enum ClusterCreateTypeNames {
  'one-click' = 'One-Click',
  'custom' = 'Custom',
  'single-master' = 'Single Master',
  'multi-master' = 'Multi-Master',
}

export enum BareOsRequiredNodes {
  'one-click' = 1,
  'single-master' = 1,
  'multi-master' = 2,
}

export type HealthStatus = 'healthy' | 'partially_healthy' | 'unhealthy' | 'unknown'

interface IClusterAsyncAction {
  progressPercent: any
  version: string
  baseUrl: string
}
export interface IClusterAction extends ClusterElement, INormalizedCluster, IClusterAsyncAction {}

export type TransientStatus = 'creating' | 'deleting' | 'updating' | 'upgrading' | 'converging'

export type ConnectionStatus = 'connected' | 'partially_connected' | 'disconnected'

export type ApiServerStatus = 'online' | 'offline' | 'degraded'

// progressPercent,
//         version,
//         baseUrl
export interface IClusterSelector extends IClusterAction {
  hasVpn: boolean
  hasLoadBalancer: boolean
  etcdBackupEnabled: boolean
  tasks: Pkg[]
  usage: {
    compute: any
    memory: any
    disk: any
    grafanaLink: string
  }
  nodes: INodesSelector[]
  masterNodes: INodesSelector[]
  workerNodes: INodesSelector[]
  healthyMasterNodes: INodesSelector[]
  healthyWorkerNodes: INodesSelector[]
  masterNodesHealthStatus: HealthStatus | TransientStatus
  workerNodesHealthStatus: HealthStatus | TransientStatus
  connectionStatus: ConnectionStatus | TransientStatus
  healthStatus: HealthStatus | TransientStatus
  hasMasterNode: boolean
  highlyAvailable: boolean
  links: {
    dashboard: string | null
    kubeconfig: {
      cluster: IClusterAction
    } | null
    cli: {
      host: string
      cluster: IClusterAction
    } | null
  }
}
// export interface IClusterSelector {
//   name: string
//   uuid: string
//   canUpgrade: boolean
//   containersCidr: string
//   created_at: string
//   servicesCidr: string
//   isKubernetes: number
//   isSwarm: number
//   isMesos: number
//   masterIp: string
//   externalDnsName: string
//   debug: string
//   status: string
//   flannelIfaceLabel: string
//   flannelPublicIfaceLabel: string
//   dockerRoot: string
//   etcdDataDir: string
//   lastOp: string | null
//   lastOk: null
//   keystoneEnabled: number
//   authzEnabled: number
//   taskStatus: string
//   taskError: string | null
//   numMasters: number
//   numWorkers: number
//   privileged: boolean
//   appCatalogEnabled: boolean
//   projectId: string
//   runtimeConfig: string
//   networkPlugin: string
//   allowWorkloadsOnMaster: boolean
//   enableMetallb: number
//   metallbCidr: string
//   masterVipIpv4: string
//   masterVipVrouterId: string
//   masterVipIface: string
//   k8sApiPort: string
//   mtuSize: string
//   masterless: number
//   etcdVersion: string
//   apiserverStorageBackend: string
//   enableCAS: number
//   numMinWorkers: number
//   numMaxWorkers: number
//   etcdHeartbeatIntervalMs: string
//   etcdElectionTimeoutMs: string
//   masterStatus: string
//   workerStatus: string
//   nodePoolUuid: string
//   nodePoolName: string
//   cloudProviderUuid: string
//   cloudProviderName: string
//   cloudProviderType: CloudProviders
//   cloudProperties: CloudProperties
//   tags: Tags
//   etcdBackup: EtcdBackup
//   endpoint: string
//   kubeconfigUrl: string
//   isUpgrading: boolean
//   nodes: ICombinedNode[]
//   usage: Usage
//   version: string
//   masterNodes: ICombinedNode[]
//   workerNodes: ICombinedNode[]
//   progressPercent: null
//   healthyMasterNodes: any[]
//   healthyWorkerNodes: any[]
//   masterNodesHealthStatus: HealthStatus
//   workerNodesHealthStatus: HealthStatus
//   connectionStatus: string
//   healthStatus: string
//   hasMasterNode: boolean
//   highlyAvailable: boolean
//   links: Links
//   hasVpn: boolean
//   hasLoadBalancer: boolean
//   etcdBackupEnabled: boolean
// }

// type CloudProperties = AzureCloudProperties | AwsCloudProperties | BareOSCloudProperties

// interface AzureCloudProperties {
//   location: string
//   zones: string
//   masterSku: string
//   workerSku: string
//   httpProxy: string
//   sshKey: string
// }

// interface AwsCloudProperties {
//   region: string
//   masterFlavor: string
//   workerFlavor: string
//   sshKey: string
//   serviceFqdn: string
//   ami: string
//   domainId: string
//   isPrivate: string
//   usePf9Domain: string
//   internalElb: string
//   azs: string
//   numSpotWorkers: string
//   spotWorkerFlavor: string
//   spotPrice: string
// }

// interface BareOSCloudProperties {
//   masterNodes: string
//   statusOfMasters: string
//   statusOfWorkers: string
// }

// interface EtcdBackup {
//   storageProperties: EtcdBackupStorageProperties
//   intervalInMins: string
// }

// interface EtcdBackupStorageProperties {
//   localPath: string
// }

// interface Links {
//   dashboard: null
//   kubeconfig: null
//   cli: null
// }

// interface Tags {
//   [key: string]: string
// }

// interface Usage {
//   compute: Metric
//   memory: Metric
//   disk: Metric
//   grafanaLink?: string
// }

// interface Metric {
//   current: number
//   max: number
//   percent: number
// }

export type IClusterStatus = 'ok' | 'pause' | 'fail' | 'unknown' | 'error' | 'loading' | 'upgrade'
