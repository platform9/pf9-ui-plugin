import { k8sPrefix } from 'app/constants'
import { CloudProviders } from 'k8s/components/infrastructure/clusters/model'

interface GenericKVP {[key: string]: string}

// This will make a parameter optional if no type definition is passed
type RouterPathFn<T> = (...params: OptionalParamType<T>) => string
type OptionalParamType<T> = T extends null ? [GenericKVP?] : [T & GenericKVP]

class Route<T = null> {
  public url: string
  public path: RouterPathFn<T>

  constructor (url: string) {
    this.url = url
    // compiler dislikes an inline type definition "this.path: RouterPathFn<T>"
    const path: RouterPathFn<T> = (...params: OptionalParamType<T>) => {
      return createUrlWithQueryString(this.url, ...params)
    }
    this.path = path
  }
}

export const routes = {
  cluster: {
    list: new Route(`${k8sPrefix}/infrastructure#clusters`),
    edit: new Route<{id: string}>(`${k8sPrefix}/infrastructure/clusters/edit/:id`),
    detail: new Route<{id: string}>(`${k8sPrefix}/infrastructure/clusters/:id#clusterDetails`),
    nodes: new Route<{id: string}>(`${k8sPrefix}/infrastructure/clusters/:id#nodes`),
    convergingNodes: new Route<{id: string}>(`${k8sPrefix}/infrastructure/clusters/:id#convergingNodes`),
    add: new Route(`${k8sPrefix}/infrastructure/clusters/add`),
    addAws: new Route(`${k8sPrefix}/infrastructure/clusters/addAws`),
    addAzure: new Route(`${k8sPrefix}/infrastructure/clusters/addAzure`),
    addBareOs: new Route(`${k8sPrefix}/infrastructure/clusters/addBareOs`),
    scaleMasters: new Route<{id: string}>(`${k8sPrefix}/infrastructure/clusters/scaleMasters/:id`),
    scaleWorkers: new Route<{id: string}>(`${k8sPrefix}/infrastructure/clusters/scaleWorkers/:id`),
  },
  dashboard: new Route(`${k8sPrefix}/dashboard`),
  apiAccess: new Route(`${k8sPrefix}/api_access`),
  nodes: {
    list: new Route(`${k8sPrefix}/infrastructure#nodes`),
    detail: new Route<{id: string}>(`${k8sPrefix}/infrastructure/nodes/:id`),
    download: new Route(`${k8sPrefix}/infrastructure/nodes/cli/download`),
  },
  cloudProviders: {
    list: new Route(`${k8sPrefix}/infrastructure#cloudProviders`),
    edit: new Route<{id: string}>(`${k8sPrefix}/infrastructure/cloudProviders/edit/:id`),
    add: new Route<{type: CloudProviders}>(`${k8sPrefix}/infrastructure/cloudProviders/add`),
  },
  apps: {
    list: new Route(`${k8sPrefix}/apps`),
    detail: new Route<{clusterId: string, release: string, id: string}>(`${k8sPrefix}/apps/:clusterId/:release/:id`),
    deployed: new Route<{clusterId: string, release: string}>(`${k8sPrefix}/apps/deployed/:clusterId/:release`),
  },
  pods: {
    list: new Route(`${k8sPrefix}/pods#pods`),
    deployments: new Route(`${k8sPrefix}/pods#deployments`),
    services: new Route(`${k8sPrefix}/pods#services`),
    add: new Route(`${k8sPrefix}/pods/add`),
    addDeployments: new Route(`${k8sPrefix}/pods/deployments/add`),
    addServices: new Route(`${k8sPrefix}/pods/services/add`),
  },
  storage: {
    list: new Route(`${k8sPrefix}/storage_classes`),
    add: new Route(`${k8sPrefix}/storage_classes/add`),
  },
  logging: {
    list: new Route(`${k8sPrefix}/logging`),
    add: new Route(`${k8sPrefix}/logging/add`),
    edit: new Route<{id: string}>(`${k8sPrefix}/logging/edit/:id`),
  },
  namespaces: {
    list: new Route(`${k8sPrefix}/namespaces`),
    add: new Route(`${k8sPrefix}/namespaces/add`),
  },
  userManagement: {
    users: new Route(`${k8sPrefix}/user_management#users`),
    tenants: new Route(`${k8sPrefix}/user_management#tenants`),
    addTenant: new Route(`${k8sPrefix}/user_management/tenants/add`),
    editTenant: new Route<{id: string}>(`${k8sPrefix}/user_management/tenants/edit/:id`),
    addUser: new Route(`${k8sPrefix}/user_management/users/add`),
    editUser: new Route<{id: string}>(`${k8sPrefix}/user_management/users/edit/:id`),
  },
  prometheus: {
    list: new Route(`${k8sPrefix}/prometheus`),
    add: new Route(`${k8sPrefix}/prometheus/instances/add`),
    edit: new Route<{id: string}>(`${k8sPrefix}/prometheus/instances/edit/:id`),
    editRules: new Route<{id: string}>(`${k8sPrefix}/prometheus/rules/edit/:id`),
    editServiceMonitors: new Route<{id: string}>(`${k8sPrefix}/prometheus/serviceMonitors/edit/:id`),
    editAlertManagers: new Route<{id: string}>(`${k8sPrefix}/prometheus/alertManagers/edit/:id`),
  },
  rbac: {
    list: new Route(`${k8sPrefix}/rbac`),
    addRoles: new Route(`${k8sPrefix}/rbac/roles/add`),
    addClusterRoles: new Route(`${k8sPrefix}/rbac/clusterroles/add`),
    addRoleBindings: new Route(`${k8sPrefix}/rbac/rolebindings/add`),
    addClusterRoleBindings: new Route(`${k8sPrefix}/rbac/clusterrolebindings/add`),
    editRoles: new Route<{id: string, clusterId: string}>(`${k8sPrefix}/rbac/roles/edit/:id/cluster/:clusterId`),
    editClusterRoles: new Route<{id: string, clusterId: string}>(`${k8sPrefix}/rbac/clusterroles/edit/:id/cluster/:clusterId`),
    editRoleBindings: new Route<{id: string, clusterId: string}>(`${k8sPrefix}/rbac/rolebindings/edit/:id/cluster/:clusterId`),
    editClusterRoleBindings: new Route<{id: string, clusterId: string}>(`${k8sPrefix}/rbac/clusterrolebindings/edit/:id/cluster/:clusterId`),
  }
}

/*
  We can re-create urls with dynamic content via this helper.
  Also appends any kvp's to query string params that aren't in the URL

  e.g.
    createUrlWithQueryString(Routes.Cluster.Detail, {id: 'asdf'})
    produces /ui/kubernetes/infrastructure/clusters/asdf`,
*/
const createUrlWithQueryString = (url: string, params?: GenericKVP) => {
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
