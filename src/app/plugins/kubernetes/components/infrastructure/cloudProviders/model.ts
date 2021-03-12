import { INodesSelector } from '../nodes/model'
import { IClusterSelector } from '../clusters/model'
import { GetCloudProvider } from 'api-client/qbert.model'

export enum CloudProviders {
  Aws = 'aws',
  Azure = 'azure',
  Google = 'google',
  BareOS = 'local',
  PhysicalMachine = 'physical',
  VirtualMachine = 'virtual',
  EKS = 'eks',
  AKS = 'aks',
  GKE = 'gke',
}

export enum CloudProvidersFriendlyName {
  aws = 'AWS',
  azure = 'Azure',
  local = 'BareOS',
}

export interface ICloudProvidersSelector extends GetCloudProvider {
  descriptiveType: string
  deployedCapacity: DeployedCapacity
  clusters: IClusterSelector[]
  nodes: INodesSelector[]
}

// export interface ICloudProvider {
//   name: string
//   type: CloudProviders
//   uuid: string
//   nodePoolUuid: string
//   descriptiveType: string
//   deployedCapacity: DeployedCapacity
//   clusters: IClusterSelector[]
//   nodes: ICombinedNode[]
// }
export interface DeployedCapacity {
  compute: Compute
  memory: Compute
  disk: Compute
  grafanaLink?: null | string
}

export interface Compute {
  current: number
  max: number
  percent: number
}
