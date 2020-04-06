export interface ResMgrHost {
  id: string
  message: string
  role_status: string
  extensions: any
  hypervisor_info?: HypervisorInfo
  roles: string[]
  info: ResMgrInfo
}

export interface HypervisorInfo {
  hypervisor_type: string
}

export interface ResMgrInfo {
  hostname: string
  os_family: string
  arch: string
  os_info: string
  responding: boolean
  last_response_time: string
}
