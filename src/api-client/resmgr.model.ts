// Keep these for now, this way we can easily see which have had types generated
// export interface ResMgr {
//   getHosts: Host[]
// }

export enum RoleStatus {
  Ok = 'ok',
  Failed = 'failed',
}

export interface Host {
  id: string
  roles: string[]
  info: Info
  role_status?: RoleStatus
  hypervisor_info: HypervisorInfoClass | string
  extensions: ExtensionsClass | string
  message: string | { warn: string }
  ovsBridges?: string[]
}

export interface ExtensionsClass {
  volumes_present: IPAddress
  kube_api_status: KubeAPIStatus
  listened_ports: ListenedPorts
  interfaces: Interfaces
  cloud_metadata: CloudMetadata
  resource_usage: ResourceUsage
  physical_nics: PhysicalNics
  mounted_nfs: MountedNFS
  pf9_kube_status: Pf9KubeStatus
  ip_address: IPAddress
  cpu_stats: CPUStats
  node_metadata?: NodeMetadata
  hypervisor_details?: any
}

export interface CloudMetadata {
  status: RoleStatus
  data: CloudMetadataData
}

export interface CloudMetadataData {
  instanceId: string
  publicHostname: string
}

export interface CPUStats {
  status: RoleStatus
  data: CPUStatsData
}

export interface CPUStatsData {
  load_average: string
}

export interface Interfaces {
  status: RoleStatus
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
  netmask: Netmask
  addr: string
}

export enum Netmask {
  The2552552550 = '255.255.255.0',
  The255255255255 = '255.255.255.255',
}

export interface IPAddress {
  status: RoleStatus
  data: string[]
}

export interface KubeAPIStatus {
  status: string
  data: PurpleData | string
}

export interface PurpleData {
  responding: boolean
}

export interface ListenedPorts {
  status: string
  data: FluffyData | string
}

export interface FluffyData {
  udp: string
  tcp: string
}

export interface MountedNFS {
  status: string
  data: TentacledData | string
}

export interface TentacledData {
  mounted: any[]
  last_updated: string
}

export interface NodeMetadata {
  status: RoleStatus
  data: NodeMetadataData
}

export interface NodeMetadataData {
  isSpotInstance: boolean
}

export interface Pf9KubeStatus {
  status: RoleStatus
  data: Pf9KubeStatusData
}

export interface Pf9KubeStatusData {
  pf9_kube_start_attempt: number
  last_failed_status_check?: string
  pf9_cluster_role?: string
  last_failed_task: string
  all_tasks: string[]
  current_task: string
  current_status_check?: string
  completed_tasks: string[]
  pf9_kube_service_state: boolean | string
  all_status_checks: string[]
  last_failed_status_time?: number | string
  pf9_cluster_id?: string
  pf9_kube_node_state: string
  total_task_count?: number
  status_check_timestamp?: number | string
}

export interface PhysicalNics {
  status: string
  data: { [key: string]: string } | string
}

export interface ResourceUsage {
  status: RoleStatus
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

export interface HypervisorInfoClass {
  hypervisor_type: string
}

export interface Info {
  hostname: string
  os_family: string
  arch: string
  os_info: string
  responding: boolean
  last_response_time: null | string
}
