import { ICluster } from '../clusters/model'
import { ICombinedNode } from '../nodes/model'

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

export interface ICloudProvider {
  name: string
  type: CloudProviders
  uuid: string
  nodePoolUuid: string
  descriptiveType: string
  deployedCapacity: DeployedCapacity
  clusters: ICluster[]
  nodes: ICombinedNode[]
}
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
