import { k8sPrefix, appUrlRoot } from 'app/constants'
import { CloudProviders } from 'k8s/components/infrastructure/clusters/model'

interface GenericKVP {
  [key: string]: string
}

type OptionalGenericKVP = GenericKVP | null | void

// This will make a parameter optional if no type definition is passed
type OptionalParamType<T extends OptionalGenericKVP> = T extends null
  ? void | GenericKVP
  : T & GenericKVP
type RouterPathFn<T extends OptionalGenericKVP> = (params: OptionalParamType<T>) => string

export class Route<T extends OptionalGenericKVP = null> {
  constructor(public url: string) {}

  public path: RouterPathFn<T> = (params: OptionalParamType<T>) => {
    return this.createUrlWithQueryString(new URL(this.url, window.location.origin), params)
  }

  public toString(): string {
    return this.path(null)
  }

  /*
    createUrlWithQueryString(routes.cluster.edit, {id: 'asdf', name: 'fdsa'})
    produces /ui/kubernetes/infrastructure/clusters/edit/asdf?name=fdsa`,
  */
  private createUrlWithQueryString(url: URL, params: OptionalParamType<T>) {
    if (!params || Object.keys(params || []).length === 0) {
      return this.url
    }
    const fields: GenericKVP = { ...(params as any) }

    // nice utility to reconstruct urls from objects / models
    // replace pathname variables (e.g. '/:id') with params when applicable
    if (url.pathname.includes(':')) {
      ;(url.pathname.match(/:([0-9_a-z]+)/gi) || []).forEach((match) => {
        const key = match.replace(':', '')
        url.pathname = url.pathname.replace(match, fields[key])
        delete fields[key]
      })
    }

    // Tack on the remaining key values from our params to the URL's searchParams
    for (const [key, value] of Object.entries(fields)) {
      url.searchParams.append(key, value)
    }

    // URL requires an origin, but these routes need to omit the origin
    return `${url.toString().replace(url.origin, '')}`
  }
}

export const routes = {
  cluster: {
    list: new Route(`${k8sPrefix}/infrastructure#clusters`),
    edit: new Route<{ id: string }>(`${k8sPrefix}/infrastructure/clusters/edit/:id`),
    detail: new Route<{ id: string }>(`${k8sPrefix}/infrastructure/clusters/:id#clusterDetails`),
    nodes: new Route<{ id: string }>(`${k8sPrefix}/infrastructure/clusters/:id#nodes`),
    convergingNodes: new Route<{ id: string }>(
      `${k8sPrefix}/infrastructure/clusters/:id#convergingNodes`,
    ),
    add: new Route(`${k8sPrefix}/infrastructure/clusters/add`),
    addAws: new Route(`${k8sPrefix}/infrastructure/clusters/addAws`),
    addAzure: new Route(`${k8sPrefix}/infrastructure/clusters/addAzure`),
    addBareOs: new Route(`${k8sPrefix}/infrastructure/clusters/addBareOs`),
    scaleMasters: new Route<{ id: string }>(
      `${k8sPrefix}/infrastructure/clusters/scaleMasters/:id`,
    ),
    scaleWorkers: new Route<{ id: string }>(
      `${k8sPrefix}/infrastructure/clusters/scaleWorkers/:id`,
    ),
  },
  dashboard: new Route(`${k8sPrefix}/dashboard`),
  apiAccess: new Route(`${k8sPrefix}/api_access`),
  nodes: {
    list: new Route(`${k8sPrefix}/infrastructure#nodes`),
    detail: new Route<{ id: string }>(`${k8sPrefix}/infrastructure/nodes/:id`),
    download: new Route(`${k8sPrefix}/infrastructure/nodes/cli/download`),
  },
  cloudProviders: {
    list: new Route(`${k8sPrefix}/infrastructure#cloudProviders`),
    edit: new Route<{ id: string }>(`${k8sPrefix}/infrastructure/cloudProviders/edit/:id`),
    add: new Route<{ type: CloudProviders }>(`${k8sPrefix}/infrastructure/cloudProviders/add`),
  },
  apps: {
    list: new Route(`${k8sPrefix}/apps`),
    detail: new Route<{ clusterId: string; release: string; id: string }>(
      `${k8sPrefix}/apps/:clusterId/:release/:id`,
    ),
    deployed: new Route<{ clusterId: string; release: string }>(
      `${k8sPrefix}/apps/deployed/:clusterId/:release`,
    ),
  },
  pods: {
    list: new Route(`${k8sPrefix}/pods#pods`),
    add: new Route(`${k8sPrefix}/pods/add`),
  },
  services: {
    list: new Route(`${k8sPrefix}/pods#services`),
    add: new Route(`${k8sPrefix}/pods/services/add`),
  },
  deployments: {
    list: new Route(`${k8sPrefix}/pods#deployments`),
    add: new Route(`${k8sPrefix}/pods/deployments/add`),
  },
  storage: {
    list: new Route(`${k8sPrefix}/storage_classes`),
    add: new Route(`${k8sPrefix}/storage_classes/add`),
  },
  logging: {
    list: new Route(`${k8sPrefix}/logging`),
    add: new Route(`${k8sPrefix}/logging/add`),
    edit: new Route<{ id: string }>(`${k8sPrefix}/logging/edit/:id`),
  },
  namespaces: {
    list: new Route(`${k8sPrefix}/namespaces`),
    add: new Route(`${k8sPrefix}/namespaces/add`),
  },
  userManagement: {
    users: new Route(`${k8sPrefix}/user_management#users`),
    tenants: new Route(`${k8sPrefix}/user_management#tenants`),
    addTenant: new Route(`${k8sPrefix}/user_management/tenants/add`),
    editTenant: new Route<{ id: string }>(`${k8sPrefix}/user_management/tenants/edit/:id`),
    addUser: new Route(`${k8sPrefix}/user_management/users/add`),
    editUser: new Route<{ id: string }>(`${k8sPrefix}/user_management/users/edit/:id`),
  },
  prometheus: {
    list: new Route(`${k8sPrefix}/prometheus`),
    add: new Route(`${k8sPrefix}/prometheus/instances/add`),
    edit: new Route<{ id: string }>(`${k8sPrefix}/prometheus/instances/edit/:id`),
    editRules: new Route<{ id: string }>(`${k8sPrefix}/prometheus/rules/edit/:id`),
    editServiceMonitors: new Route<{ id: string }>(
      `${k8sPrefix}/prometheus/serviceMonitors/edit/:id`,
    ),
    editAlertManagers: new Route<{ id: string }>(`${k8sPrefix}/prometheus/alertManagers/edit/:id`),
  },
  rbac: {
    list: new Route(`${k8sPrefix}/rbac`),
    addRoles: new Route(`${k8sPrefix}/rbac/roles/add`),
    addClusterRoles: new Route(`${k8sPrefix}/rbac/clusterroles/add`),
    addRoleBindings: new Route(`${k8sPrefix}/rbac/rolebindings/add`),
    addClusterRoleBindings: new Route(`${k8sPrefix}/rbac/clusterrolebindings/add`),
    editRoles: new Route<{ id: string; clusterId: string }>(
      `${k8sPrefix}/rbac/roles/edit/:id/cluster/:clusterId`,
    ),
    editClusterRoles: new Route<{ id: string; clusterId: string }>(
      `${k8sPrefix}/rbac/clusterroles/edit/:id/cluster/:clusterId`,
    ),
    editRoleBindings: new Route<{ id: string; clusterId: string }>(
      `${k8sPrefix}/rbac/rolebindings/edit/:id/cluster/:clusterId`,
    ),
    editClusterRoleBindings: new Route<{ id: string; clusterId: string }>(
      `${k8sPrefix}/rbac/clusterrolebindings/edit/:id/cluster/:clusterId`,
    ),
  },
  password: {
    reset: new Route<{ id: string }>(`${appUrlRoot}/reset/password/:id`),
  },
}
