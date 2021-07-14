import { Host, RoleStatus, Netmask } from 'api-client/resmgr.model'
import { Node } from 'api-client/qbert.model'

export enum HostTypes {
  Qbert = 'qbert',
  Resmgr = 'resmgr',
}
export type HostType = 'qbert' | 'resmgr'
export type HostByService = { [key in HostType]: key extends 'qbert' ? Node : Host }

export interface IAnnotateResmgrFields extends HostByService {
  id: string
  roles: string[]
  roleStatus: RoleStatus
  roleData: {}
  responding: boolean
  hostname: string
  osInfo: string
  networks: any[]
  vCenterIP: any
  supportRole: boolean
  networkInterfaces: any
  warnings: any
}

export interface IAnnotateUiState extends IAnnotateResmgrFields {
  lastResponse: string
  lastResponseData: string
  hasStats: boolean
  uiState: string
}

export interface IAnnotateCloudStack extends IAnnotateUiState {
  cloudStack: 'openstack' | 'k8s' | 'unknown'
}

export interface ICombinedHost extends IAnnotateCloudStack {
  usage: {
    compute: {
      current: number
      max: number
      units: string
      type: string
    }
    memory: {
      current: number
      max: number
      units: string
      type: string
    }
    disk: {
      current: number
      max: number
      units: string
      type: string
    }
  }
}

export interface INetworkInterface {
  name: string
  mac: string
  ip: string
  netmask: Netmask
  label: string
}

export interface IResMgrHostsSelector {
  ipPreview: string
  networkInterfaces: INetworkInterface[]
  ovsBridges: any[]
}
