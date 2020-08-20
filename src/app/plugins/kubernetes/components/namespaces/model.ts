// TODO: fix these typings

import { IGenericResource, GetClusterNamespacesItem } from 'api-client/qbert.model'

export interface Namespace {
  id: string
}
type INamespaceApi = IGenericResource<GetClusterNamespacesItem>
export interface INamespace extends Omit<INamespaceApi, 'status'> {
  clusterName: string
  status: string
}
