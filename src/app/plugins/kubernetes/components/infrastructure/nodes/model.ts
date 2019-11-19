export interface Combined {
  qbert: ICombinedNode
  resmgr: Resmgr
  id: string
  roles: string[]
  roleStatus: string
  roleData: RoleData
  responding: boolean
  hostname: string
  osInfo: string
  networks: any[]
  vCenterIP: null
  supportRole: boolean
  networkInterfaces: { [key: string]: string }
  warnings: string
  uiState: string
  cloudStack: string
  usage: Usage
}

export interface ICombinedNode {
  name: string
  uuid: string
  primaryIp: string
  isMaster: number
  masterless: number
  status: string
  api_responding: number
  projectId: string
  startKube: number
  nodePoolUuid: string
  nodePoolName: string
  clusterUuid: string
  clusterName: string
  cloudProviderType: string
  combined?: Combined
  logs?: string
}

export interface Resmgr {
  info: Info
  hypervisor_info: HypervisorInfo
  roles: string[]
  role_status: string
  extensions: Extensions
  message: string
  id: string
}

export interface Extensions {
  volumes_present: VolumesPresent
  kube_api_status: KubeAPIStatus
  listened_ports: ListenedPorts
  firewalld_status: FirewalldStatus
  interfaces: Interfaces
  cloud_metadata: CloudMetadata
  resource_usage: ResourceUsage
  physical_nics: PhysicalNics
  mounted_nfs: MountedNFS
  node_metadata: NodeMetadata
  ip_address: IPAddress
  selinux_status: SelinuxStatus
  cpu_stats: CPUStats
}

export interface CloudMetadata {
  status: string
  data: CloudMetadataData
}

export interface CloudMetadataData {
  instanceId: string
  publicHostname: string
}

export interface CPUStats {
  status: string
  data: CPUStatsData
}

export interface CPUStatsData {
  load_average: string
}

export interface FirewalldStatus {
  status: string
  data: FirewalldStatusData
}

export interface FirewalldStatusData {
  error: string
}

export interface Interfaces {
  status: string
  data: InterfacesData
}

export interface InterfacesData {
  iface_ip: { [key: string]: string }
  iface_info: { [key: string]: IfaceInfo }
  ovs_bridges: any[]
}

export interface IfaceInfo {
  mac: string
  ifaces: Iface[]
}

export interface Iface {
  broadcast: string
  netmask: string
  addr: string
}

export interface IPAddress {
  status: string
  data: string[]
}

export interface KubeAPIStatus {
  status: string
  data: KubeAPIStatusData
}

export interface KubeAPIStatusData {
  responding: boolean
}

export interface ListenedPorts {
  status: string
  data: ListenedPortsData
}

export interface ListenedPortsData {
  udp: string
  tcp: string
}

export interface MountedNFS {
  status: string
  data: MountedNFSData
}

export interface MountedNFSData {
  mounted: any[]
  last_updated: string
}

export interface NodeMetadata {
  status: string
  data: NodeMetadataData
}

export interface NodeMetadataData {
  isSpotInstance: boolean
}

export interface PhysicalNics {
  status: string
  data: PhysicalNicsData
}

export interface PhysicalNicsData {
  default: string
  cni0?: string
  eth0: string
  flannel0: string
}

export interface ResourceUsage {
  status: string
  data: ResourceUsageData
}

export interface ResourceUsageData {
  disk: CPU
  cpu: CPU
  memory: Memory
}

export interface CPU {
  total: number
  percent: number
  used: number
}

export interface Memory {
  available: number
  total: number
  percent: number
}

export interface SelinuxStatus {
  status: string
  data: SelinuxStatusData
}

export interface SelinuxStatusData {
  status: string
}

export interface VolumesPresent {
  status: string
  data: Datum[]
}

export interface Datum {
  name: string
  free: string
  size: string
}

export interface HypervisorInfo {
  hypervisor_type: string
}

export interface Info {
  responding: boolean
  hostname: string
  last_response_time: null
  os_family: string
  arch: string
  os_info: string
}

export interface RoleData {}

export interface Usage {
  compute: Compute
  memory: Compute
  disk: Compute
}

export interface Compute {
  current: number
  max: number
  units: Units
  type: ComputeType
}

export enum ComputeType {
  Used = 'used',
}

export enum Units {
  GB = 'GB',
  GHz = 'GHz',
}
