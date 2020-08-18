import { CustomerMetadata } from './model'

// Keep these for now, this way we can easily see which have had types generated
// export interface Keystone {
//   renewToken: AuthToken
//   getProjectsAuth: GetProjectsAuth
//   changeProjectScope: AuthToken
//   getServiceCatalog: GetServiceCatalog
//   resetCookie: string
//   getRegions: GetRegions
//   getFeatures: GetFeatureLinks
//   'getFeatures/featuresUrl': GetFeatures
//   getAllTenantsAllUsers: GetAllTenantsAllUsers
//   getUsers: GetUsers
//   getCredentials: GetCredentials
//   renewScopedToken: AuthToken
//   getRoles: GetRoles
//   getUserRoleAssignments: GetUserRoleAssignments
// }

export interface AuthToken {
  token: Token
}

export interface UpdateProject {
  project: ProjectElement
}

export interface UpdateUser {
  user: UpdateUserUser
}

export interface UpdateUserUser {
  is_local: boolean
  default_project: string
  displayname: string
  name: string
  links: ProjectLinks
  extra: Extra
  enabled: boolean
  id: string
  email: string
  options: CustomerMetadata
  domain_id: ParentIDEnum
  password_expires_at: null
}
export interface Extra {
  is_local: boolean
  default_project: string
  displayname: string
  email: string
}

export interface Token {
  is_domain: boolean
  methods: string[]
  roles: Domain[]
  expires_at: string
  project: UserClass
  user: UserClass
  audit_ids: string[]
  issued_at: string
}

export interface UserClass {
  domain: Domain
  id: string
  name: string
  password_expires_at?: null
}

export interface Domain {
  id: ParentIDEnum
  name: DomainName
}

export enum ParentIDEnum {
  Default = 'default',
  The9A9F1Bdc0753447089737280010F080F = '9a9f1bdc0753447089737280010f080f',
}

export enum DomainName {
  Admin = 'admin',
  Default = 'Default',
}

export interface GetAllTenantsAllUsers {
  tenants: Tenant[]
}

export interface Tenant {
  users: TenantUser[]
  name: string
  enabled: boolean
  id: string
  domain_id: ParentIDEnum | null
  description: string
}

export interface TenantUser {
  username: string
  mfa: Mfa
  displayname: null | string
  name: string
  tenantId: string | null
  enabled: boolean
  id: string
  email: null | string
}

export interface Mfa {
  enabled: boolean
}

export interface GetCredentials {
  credentials: any[]
  links: GetCredentialsLinks
}

export interface GetCredentialsLinks {
  self: string
  previous: null
  next: null
}

export interface GetFeatureLinks {
  links: FeatureLinks
}

export interface FeatureLinks {
  token2cookie: string
  features: string
}

export interface GetFeatures {
  active_nav_background: string
  active_nav_left_border: string
  active_nav_text_color: string
  branding_name: string
  browser_title: string
  churnZeroKey: string
  custom_tour_link: string
  customer_metadata: CustomerMetadata
  customer_tier: string
  developer_mode: boolean
  experimental: Experimental
  extra_css: any[]
  extra_js: any[]
  header_background_color: string
  header_border: boolean
  header_border_color: string
  header_text_color: string
  inactive_nav_background: string
  inactive_nav_text_color: string
  intercom_id: string
  liftoff_id: string
  login_button_color: string
  login_button_text_color: string
  login_header_background_color: string
  nav_background: string
  releaseVersion: string
  shortname: string
  sso_login_url: string
  support_link: string
  support_request_endpoint: string
  updateTime: number
  versioning: Versioning
}

export interface Experimental {
  assumeRole: boolean
  aws: boolean
  azure: boolean
  boot_from_volume: boolean
  churnZero: boolean
  cinder: boolean
  cloud_init: boolean
  containervisor: boolean
  deletion_upon_termination: boolean
  designate: boolean
  docker: boolean
  e2etest: boolean
  edit_images: boolean
  forced_cloud_init: boolean
  gce: boolean
  guided_tour: boolean
  heat: boolean
  hidePrebuiltApps: boolean
  high_availability: boolean
  hypervisor: boolean
  images_public_catalog: boolean
  images_url_import: boolean
  instance_resize: boolean
  instances_refresh_interval: number
  intercom: boolean
  intercom_admin_only: boolean
  ironic: boolean
  kube2go: boolean
  leases: boolean
  liftoff: boolean
  live_migration: boolean
  managed_apps: boolean
  mfa: boolean
  mixpanel: boolean
  monitoring: boolean
  nano: boolean
  nano_aggregate_max: number
  nano_max: number
  networking_plugin: string
  neutron: boolean
  notifications: boolean
  novnc: boolean
  omni: boolean
  openstackEnabled: boolean
  port_security: boolean
  preserveSession: boolean
  sandbox: boolean
  scheduler: boolean
  soft_delete: boolean
  sso: boolean
  ubuntu_agent_installer: boolean
  vmw_gateway: boolean
}

export interface Versioning {
  packages: { [key: string]: Package }
}

export interface Package {
  origin: Origin
  version: string
}

export enum Origin {
  Installed = 'installed',
  Platform9Local = '@platform9-local',
}

export interface GetProjectsAuth {
  links: GetCredentialsLinks
  projects: ProjectElement[]
}

export interface ProjectElement {
  is_domain: boolean
  description: string
  links: ProjectLinks
  enabled: boolean
  id: string
  parent_id: ParentIDEnum
  domain_id: ParentIDEnum
  name: string
}

export interface ProjectLinks {
  self: string
}

export interface GetRegions {
  regions: Region[]
  links: GetCredentialsLinks
}

export interface Region {
  parent_region_id: null
  id: ID
  links: ProjectLinks
  description: string
}

export enum ID {
  Ironic = 'ironic',
  Main = 'main',
  KVMNeutron = 'KVM-Neutron',
}

export interface GetRoles {
  links: GetCredentialsLinks
  roles: Role[]
}

export interface Role {
  domain_id: null
  id: string
  links: ProjectLinks
  name: string
  displayName?: string
  description?: string
}

export interface GetServiceCatalog {
  catalog: Catalog[]
  links: ProjectLinks
}

export interface Catalog {
  endpoints: Endpoint[]
  type: string
  id: string
  name: string
}

export interface Endpoint {
  url: string
  interface: Interface
  region: ID
  region_id: ID
  id: string
}

export enum Interface {
  Admin = 'admin',
  Internal = 'internal',
  Public = 'public',
}

export interface IFace {
  id: Endpoint['id']
  url: Endpoint['url']
  type: Catalog['type']
  iface: Interface
}

export interface ServicesByName {
  [key: string]: {
    [key in Interface]: IFace
  }
}

export interface ServicesByRegion {
  [key in ID]: ServicesByName
}
export interface GetUserRoleAssignments {
  role_assignments: RoleAssignment[]
  links: GetCredentialsLinks
}

export interface RoleAssignment {
  scope: Scope
  role: Domain
  user: UserClass
  links: RoleAssignmentLinks
}

export interface RoleAssignmentLinks {
  assignment: string
}

export interface Scope {
  project: UserClass
}

export interface GetUsers {
  users: User[]
  links: GetCredentialsLinks
}

export interface User {
  username?: string
  is_local: boolean
  displayname?: null | string
  name: string
  links: ProjectLinks
  domain_id: UserDomainID
  enabled: boolean
  options: CustomerMetadata
  default_project_id?: string
  id: string
  email?: null | string
  password_expires_at: null
  default_project?: string | null
  description?: null
  tenantId?: string
  tour?: string
}

export enum UserDomainID {
  D6D00143D33744179136E8E451C6Ba39 = 'd6d00143d33744179136e8e451c6ba39',
  Default = 'default',
  The4Dd438F93338497Cb2B08A3F16992B26 = '4dd438f93338497cb2b08a3f16992b26',
}
