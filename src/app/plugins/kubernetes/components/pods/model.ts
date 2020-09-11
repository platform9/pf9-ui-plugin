import {
  FluffySelector,
  GetClusterDeploymentsItem,
  GetClusterKubeServicesItem,
  GetClusterPodsItem,
  IGenericResource,
  MatchLabelsClass,
  NamespaceEnum,
  PurpleLabels,
  SpecType,
} from 'api-client/qbert.model'

export interface IPodSelector extends IGenericResource<GetClusterPodsItem> {
  dashboardUrl: string
  id: string
  name: string
  namespace: string
  clusterName: string
}

export interface IDeploymentSelector extends IGenericResource<GetClusterDeploymentsItem> {
  dashboardUrl: string
  id: string
  name: string
  namespace: string
  clusterName: string
  created: string
  selectors: MatchLabelsClass
  pods: number
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
