// TODO: fix these typings

export interface TenantWithUsers {
  id: string
  name: string
  domain_id: string
  users: any[]
}

export interface Tenant extends TenantWithUsers {
  clusters: any[]
}
