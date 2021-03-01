import { Host } from 'api-client/resmgr.model'
import { Tenant, RoleAssignment, IFace, User, Role } from 'api-client/keystone.model'
import {
  IGenericResource,
  GetClusterNamespacesItem,
  GetClusterPodsItem,
  Node,
  GetClusterDeploymentsItem,
  GetClusterKubeServicesItem,
  GetCloudProvider,
  IGenericClusterizedResponse,
  GetClusterRolesItem,
  GetClusterClusterRoleBindingsItem,
  AlertManagerAlert,
} from 'api-client/qbert.model'
import { IClusterAction } from './components/infrastructure/clusters/model'
import { ClusterTag } from 'api-client/appbert.model'
import { IAlertOverTime } from './components/alarms/model'
import { IAlertRule } from './components/monitoring/model'

export interface GlobalState {
  cachedData: IDataKeys
}

export interface IDataKeys {
  Nodes: Node[]
  Clusters: IClusterAction[]
  ImportedClusters: any
  Pods: Array<IGenericResource<GetClusterPodsItem>>
  ResMgrHosts: Host[]
  CombinedHosts: any // ? dont see where we load them
  CoreApiResources: any // no model for this yet
  ApiResources: any // no model for this yet
  Deployments: Array<IGenericResource<GetClusterDeploymentsItem>>
  KubeServices: Array<IGenericResource<GetClusterKubeServicesItem>>
  Namespaces: Array<IGenericResource<GetClusterNamespacesItem>>
  AppDetails: any // no model for this yet
  Apps: any // no model for this yet
  AppVersions: any // no model for this yet
  ApiGroups: any // no model for this yet
  Releases: any // no model for this yet
  ReleaseDetail: any[] // no model for this yet
  RepositoriesWithClusters: any // no model for this yet
  Repositories: any // no model for this yet
  CloudProviders: GetCloudProvider[]
  CloudProviderDetails: any // no model for this yet
  CloudProviderRegionDetails: any // no model for this yet
  ClusterTags: ClusterTag[]
  ClusterRoles: Array<IGenericClusterizedResponse<GetClusterRolesItem>>
  PrometheusInstances: Array<IGenericClusterizedResponse<any>>
  ServiceAccounts: any // no model for this yet
  Services: any // no model for this yet
  PrometheusRules: Array<IGenericClusterizedResponse<any>> // no model for this yet
  PrometheusServiceMonitors: Array<IGenericClusterizedResponse<any>> // no model for this yet
  PrometheusAlertManagers: Array<IGenericClusterizedResponse<any>> // no model for this yet
  StorageClasses: Array<IGenericResource<GetClusterClusterRoleBindingsItem>>
  Loggings: any // no model for this yet
  Alerts: AlertManagerAlert[]
  AlertsTimeSeries: IAlertOverTime[]
  AlertRules: IAlertRule[]
  ApiEndpoints: Array<IFace & { name: string }>
  Ssh: any // ? dont see where we load them
  ServiceCatalog: Array<IFace & { name: string }>
  Endpoints: Array<IFace & { name: string }>
  KubeRoles: Array<IGenericClusterizedResponse<GetClusterRolesItem>>
  RoleBindings: Array<IGenericClusterizedResponse<GetClusterClusterRoleBindingsItem>>
  ClusterRoleBindings: Array<IGenericClusterizedResponse<GetClusterClusterRoleBindingsItem>>
  ManagementUsers: User[]
  ManagementTenants: Tenant[]
  ManagementRoles: Role[]
  ManagementTenantsRoleAssignments: RoleAssignment[]
  ManagementUsersRoleAssignments: RoleAssignment[]
  ManagementCredentials: any // no model for this yet
  ManagementGroups: any // no model for this yet
  ManagementGroupsMappings: any // no model for this yet
  Tenants: any // is this needed? only in openstack
  Users: any // is this needed? only in openstack
}
