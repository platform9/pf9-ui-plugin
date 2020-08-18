// TODO: fix these typings

import { IGenericResource, GetClusterNamespacesItem } from 'api-client/qbert.model'

export interface Namespace {
  id: string
}
type INamespaceApi = Array<IGenericResource<GetClusterNamespacesItem>>
export interface INamespace extends INamespaceApi {
  clusterName: string
  status: string
}
