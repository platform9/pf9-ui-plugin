import { k8sPrefix } from 'app/constants'
import { CloudProviders } from 'k8s/components/infrastructure/clusters/model'
interface GenericKVP {[key: string]: string}

const routes = {
  cluster: {
    list: `${k8sPrefix}/infrastructure#clusters`,
    edit: `${k8sPrefix}/infrastructure/clusters/edit/:id`,
    detail: `${k8sPrefix}/infrastructure/clusters/:id#clusterDetails`,
    nodes: `${k8sPrefix}/infrastructure/clusters/:id#nodes`,
    convergingNodes: `${k8sPrefix}/infrastructure/clusters/:id#convergingNodes`,
    add: `${k8sPrefix}/infrastructure/clusters/add`,
    addAws: `${k8sPrefix}/infrastructure/clusters/addAws`,
    addAzure: `${k8sPrefix}/infrastructure/clusters/addAzure`,
    addBareOs: `${k8sPrefix}/infrastructure/clusters/addBareOs`,
    scaleMasters: `${k8sPrefix}/infrastructure/clusters/scaleMasters/:id`,
    scaleWorkers: `${k8sPrefix}/infrastructure/clusters/scaleWorkers/:id`,
  },
  dashboard: `${k8sPrefix}/dashboard`,
  apiAccess: `${k8sPrefix}/api_access`,
  nodes: {
    list: `${k8sPrefix}/infrastructure#nodes`,
    detail: `${k8sPrefix}/infrastructure/nodes/:id`,
    download: `${k8sPrefix}/infrastructure/nodes/cli/download`,
  },
  cloudProviders: {
    list: `${k8sPrefix}/infrastructure#cloudProviders`,
    edit: `${k8sPrefix}/infrastructure/cloudProviders/edit/:id`,
    add: `${k8sPrefix}/infrastructure/cloudProviders/add`,
  },
  apps: {
    list: `${k8sPrefix}/apps`,
    detail: `${k8sPrefix}/apps/:clusterId/:release/:id`,
    deployed: `${k8sPrefix}/apps/deployed/:clusterId/:release`,
  },
  pods: {
    list: `${k8sPrefix}/pods#pods`,
    deployments: `${k8sPrefix}/pods#deployments`,
    services: `${k8sPrefix}/pods#services`,
    add: `${k8sPrefix}/pods/add`,
    addDeployments: `${k8sPrefix}/pods/deployments/add`,
    addServices: `${k8sPrefix}/pods/services/add`,
  },
  storage: {
    list: `${k8sPrefix}/storage_classes`,
    add: `${k8sPrefix}/storage_classes/add`,
  },
  logging: {
    list: `${k8sPrefix}/logging`,
    add: `${k8sPrefix}/logging/add`,
    edit: `${k8sPrefix}/logging/edit/:id`,
  },
  namespaces: {
    list: `${k8sPrefix}/namespaces`,
    add: `${k8sPrefix}/namespaces/add`,
  },
  userManagement: {
    users: `${k8sPrefix}/user_management#users`,
    tenants: `${k8sPrefix}/user_management#tenants`,
    addTenant: `${k8sPrefix}/user_management/tenants/add`,
    editTenant: `${k8sPrefix}/user_management/tenants/edit/:id`,
    addUser: `${k8sPrefix}/user_management/users/add`,
    editUser: `${k8sPrefix}/user_management/users/edit/:id`,
  },
  prometheus: {
    list: `${k8sPrefix}/prometheus`,
    add: `${k8sPrefix}/prometheus/instances/add`,
    edit: `${k8sPrefix}/prometheus/instances/edit/:id`,
    editRules: `${k8sPrefix}/prometheus/rules/edit/:id`,
    editServiceMonitors: `${k8sPrefix}/prometheus/serviceMonitors/edit/:id`,
    editAlertManagers: `${k8sPrefix}/prometheus/alertManagers/edit/:id`,
  },
  rbac: {
    list: `${k8sPrefix}/rbac`,
    addRoles: `${k8sPrefix}/rbac/roles/add`,
    addClusterRoles: `${k8sPrefix}/rbac/clusterroles/add`,
    addRoleBindings: `${k8sPrefix}/rbac/rolebindings/add`,
    addClusterRoleBindings: `${k8sPrefix}/rbac/clusterrolebindings/add`,
    editRoles: `${k8sPrefix}/rbac/roles/edit/:id/cluster/:clusterId`,
    editClusterRoles: `${k8sPrefix}/rbac/clusterroles/edit/:id/cluster/:clusterId`,
    editRoleBindings: `${k8sPrefix}/rbac/rolebindings/edit/:id/cluster/:clusterId`,
    editClusterRoleBindings: `${k8sPrefix}/rbac/clusterrolebindings/edit/:id/cluster/:clusterId`,
  }
}

// cluster
export const pathToAddCluster = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.add, params)
}
export const pathToAddBareOSCluster = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.addBareOs, params)
}
export const pathToAddAwsCluster = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.addAws, params)
}
export const pathToAddAzureCluster = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.addAzure, params)
}
export const pathToClusters = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.list, params)
}
export const pathToClusterDetail = (params: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.detail, params)
}
export const pathToClusterNodes = (params: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.nodes, params)
}
export const pathToClusterConvergingNodes = (params: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.convergingNodes, params)
}
export const pathToEditCluster = (params: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.edit, params)
}
export const pathToScaleMasters = (params: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.scaleMasters, params)
}
export const pathToScaleWorkers = (params: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.cluster.scaleWorkers, params)
}

// dashboard
export const pathToDashboard = (params: GenericKVP) => {
  return createUrlWithQueryString(routes.dashboard, params)
}

// apiAccess
export const pathToApiAccess = (params: GenericKVP) => {
  return createUrlWithQueryString(routes.apiAccess, params)
}

// nodes
export const pathToNodes = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.nodes.list, params)
}
export const pathToNodeDetail = (params?: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.nodes.detail, params)
}
export const pathToNodeDownload = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.nodes.download, params)
}

// cloudProviders
export const pathToAddCloudProvider = (params?: {type?: CloudProviders} & GenericKVP) => {
  return createUrlWithQueryString(routes.cloudProviders.add, params)
}
export const pathToCloudProviders = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.cloudProviders.list, params)
}
export const pathToEditCloudProvider = (params?: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.cloudProviders.edit, params)
}

// pods
export const pathToPods = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.pods.list, params)
}
export const pathToPodDeployments = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.pods.deployments, params)
}
export const pathToPodServices = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.pods.services, params)
}
export const pathToAddPods = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.pods.add, params)
}
export const pathToPodsAddDeployments = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.pods.addDeployments, params)
}
export const pathToPodsAddServices = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.pods.addServices, params)
}

// userManagement
export const pathToUsers = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.userManagement.users, params)
}
export const pathToTenants = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.userManagement.tenants, params)
}
export const pathToAddTenant = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.userManagement.addTenant, params)
}
export const pathToEditTenant = (params?: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.userManagement.editTenant, params)
}
export const pathToAddUser = (params?: GenericKVP) => {
  return createUrlWithQueryString(routes.userManagement.addUser, params)
}
export const pathToEditUser = (params?: {id: string} & GenericKVP) => {
  return createUrlWithQueryString(routes.userManagement.editUser, params)
}

/*
  We can re-create urls with dynamic content via this helper.
  Also appends any kvp's to query string params that aren't in the URL

  e.g.
    createUrlWithQueryString(Routes.Cluster.Detail, {id: 'asdf'})
    produces /ui/kubernetes/infrastructure/clusters/asdf`,
*/
const createUrlWithQueryString = (url: string, params: GenericKVP) => {
  if (!url) {
    console.error('URL is not defined for action: ', params)
  }
  if (!params) {
    return url
  }
  params = { ...params }

  if (url.includes(':')) {
    // nice utility to reconstruct urls from objects / models
    (url.match(/:([0-9_a-z]+)/gi) || []).forEach((match) => {
      const key = match.replace(':', '')
      url = url.replace(match, params[key])
      delete params[key]
    })
  }

  if (Object.keys(params).length > 0) {
    url = `${url}?${paramsToQueryString(params)}`
  }
  return url
}

export const paramsToQueryString = (params: GenericKVP) => {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, value)
  }
  return searchParams.toString()
}
