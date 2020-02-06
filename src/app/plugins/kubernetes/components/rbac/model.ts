export interface IRbacAPIGroup {
  name: string
  resources: IRbacAPIGroupResource[]
  groupVersion: string
}

export interface IRbacAPIGroupResource {
  name: string
  singularName: string
  namespaced: boolean
  kind: string
  verbs: IRbacAPIGroupResourceVerb[]
  id: string
  clusterId: string
  apiGroup?: string
  shortNames?: string[]
  categories?: string[]
  group?: string
  version?: string
}

export enum IRbacAPIGroupResourceVerb {
  Create = 'create',
  Delete = 'delete',
  Deletecollection = 'deletecollection',
  Get = 'get',
  List = 'list',
  Patch = 'patch',
  Update = 'update',
  Watch = 'watch',
}
