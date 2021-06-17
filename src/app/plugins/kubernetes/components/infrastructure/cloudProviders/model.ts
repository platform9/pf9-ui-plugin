import { INodesSelector } from '../nodes/model'
import { IClusterSelector } from '../clusters/model'
import { GetCloudProvider } from 'api-client/qbert.model'
import { ImportedClusterSelector } from '../importedClusters/model'

export enum CloudProviders {
  Aws = 'aws',
  Azure = 'azure',
  Gcp = 'gke',
  BareOS = 'local',
  PhysicalMachine = 'physical',
  VirtualMachine = 'virtual',
}

export enum CloudProvidersFriendlyName {
  aws = 'AWS',
  azure = 'Azure',
  local = 'BareOS',
}

export enum CloudDefaults {
  Region = 'region',
  RegionLabel = 'regionDisplayName',
  Domain = 'domain', // Route 53 Domain. AWS only
  DomainLabel = 'domainLabel',
  SshKey = 'sshKey',
  SshKeyLabel = 'sshKeyLabel',
}

export interface ICloudProvidersSelector extends GetCloudProvider {
  descriptiveType: string
  deployedCapacity: DeployedCapacity
  clusters: IClusterSelector[]
  nodes: INodesSelector[]
  importedClusters: ImportedClusterSelector[]
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
