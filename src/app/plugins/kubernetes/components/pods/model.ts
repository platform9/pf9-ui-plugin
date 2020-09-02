import {
  GetClusterPodsItem,
  IGenericResource,
  PurpleLabels,
  FluffySelector,
  SpecType,
  NamespaceEnum,
  GetClusterKubeServicesItem,
} from 'api-client/qbert.model'

export interface IPodSelector extends IGenericResource<GetClusterPodsItem> {
  dashboardUrl: string
  id: string
  name: string
  namespace: string
  // labels: string
  clusterName: string
}

export interface IServicesSelector
  extends Omit<IGenericResource<GetClusterKubeServicesItem>, 'status'> {
  dashboardUrl: string
  labels: PurpleLabels
  selectors: FluffySelector
  type: SpecType
  status: string
  clusterIp: any
  internalEndpoints: string[]
  externalEndpoints: string[]
  namespace: NamespaceEnum
  clusterName: string
}
