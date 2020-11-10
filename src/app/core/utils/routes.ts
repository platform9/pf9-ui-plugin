import { k8sPrefix, appUrlRoot } from 'app/constants'
import URLPattern from 'url-pattern'

interface GenericKVP {
  [key: string]: string
}

interface IRouteOptions {
  url: string
  name: string
}

type OptionalGenericKVP = GenericKVP | null | void

// This will make a parameter optional if no type definition is passed
type OptionalParamType<T extends OptionalGenericKVP> = T extends null
  ? void | GenericKVP
  : T & GenericKVP
type RouterPathFn<T extends OptionalGenericKVP> = (params: OptionalParamType<T>) => string

export class Route<T extends OptionalGenericKVP = null> {
  url: string
  name: string
  pattern: URLPattern

  static routes: Route[] = []

  constructor(options: IRouteOptions) {
    this.url = options.url
    this.name = options.name
    this.pattern = new URLPattern(options.url)
  }

  public path: RouterPathFn<T> = (params: OptionalParamType<T>) => {
    return this.createUrlWithQueryString(new URL(this.url, window.location.origin), params)
  }

  public toString(): string {
    return this.path(null)
  }

  /**
   * Register a route for this application
   * @param route route to register
   */
  static register(routeOptions: IRouteOptions): Route {
    const route = new Route(routeOptions)
    Route.routes.push(route)
    return route
  }

  static getRoutes(): Route[] {
    return Route.routes
  }

  static getCurrentRoute(): Route | null {
    return Route.find()
  }

  static find(pathname: string = location.pathname): Route | null {
    return Route.getRoutes().find((r) => !!r.pattern.match(pathname))
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
      const matches = url.pathname.match(/:([0-9_a-z]+)/gi) || []
      matches.forEach((match) => {
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

/* eslint-disable max-len */
export const routes = {
  cluster: {
    list: Route.register({
      url: `${k8sPrefix}/infrastructure#clusters`,
      name: 'Infrastructure:Clusters:List',
    }),
    edit: Route.register({
      url: `${k8sPrefix}/infrastructure/clusters/edit/:id`,
      name: 'Infrastructure:Clusters:Edit',
    }),
    detail: Route.register({
      url: `${k8sPrefix}/infrastructure/clusters/:id#clusterDetails`,
      name: 'Infrastructure:Clusters:Details',
    }),
    nodes: Route.register({
      url: `${k8sPrefix}/infrastructure/clusters/:id#nodes`,
      name: 'Infrastructure:Clusters:Nodes',
    }),
    nodeHealth: Route.register({
      url: `${k8sPrefix}/infrastructure/clusters/:id#nodeHealth`,
      name: 'Infrastructure:Clusters:NodeHealth',
    }),
    add: Route.register({
      url: `${k8sPrefix}/infrastructure/clusters/add`,
      name: 'Infrastructure:Clusters:Add',
    }),
    addAws: {
      custom: Route.register({
        url: `${k8sPrefix}/infrastructure/clusters/aws/add/custom`,
        name: 'Infrastructure:Clusters:AddAws:Custom',
      }),
      'one-click': Route.register({
        url: `${k8sPrefix}/infrastructure/clusters/aws/add/one-click`,
        name: 'Infrastructure:Clusters:AddAws:OneClick',
      }),
    },
    addAzure: {
      custom: Route.register({
        url: `${k8sPrefix}/infrastructure/clusters/azure/add/custom`,
        name: 'Infrastructure:Clusters:AddAzure:Custom',
      }),
      'one-click': Route.register({
        url: `${k8sPrefix}/infrastructure/clusters/azure/add/one-click`,
        name: 'Infrastructure:Clusters:AddAzure:OneClick',
      }),
    },
    addBareOs: {
      virtual: {
        'one-click': Route.register({
          url: `${k8sPrefix}/infrastructure/clusters/bareos/add/virtual/one-click`,
          name: 'Infrastructure:Clusters:AddBareOs:Virtual:OneClick',
        }),
        'single-master': Route.register({
          url: `${k8sPrefix}/infrastructure/clusters/bareos/add/virtual/single-master`,
          name: 'Infrastructure:Clusters:AddBareOs:Virtual:SingleMaster',
        }),
        'multi-master': Route.register({
          url: `${k8sPrefix}/infrastructure/clusters/bareos/add/virtual/multi-master`,
          name: 'Infrastructure:Clusters:AddBareOs:Virtual:MultiMaster',
        }),
      },
      physical: {
        'one-click': Route.register({
          url: `${k8sPrefix}/infrastructure/clusters/bareos/add/physical/one-click`,
          name: 'Infrastructure:Clusters:AddBareOs:Physical:OneClick',
        }),
        'single-master': Route.register({
          url: `${k8sPrefix}/infrastructure/clusters/bareos/add/physical/single-master`,
          name: 'Infrastructure:Clusters:AddBareOs:Physical:SingleMaster',
        }),
        'multi-master': Route.register({
          url: `${k8sPrefix}/infrastructure/clusters/bareos/add/physical/multi-master`,
          name: 'Infrastructure:Clusters:AddBareOs:Physical:MultiMaster',
        }),
      },
    },
    scaleMasters: Route.register({
      url: `${k8sPrefix}/infrastructure/clusters/scaleMasters/:id`,
      name: 'Infrastructure:Clusters:ScaleMasters',
    }),
    scaleWorkers: Route.register({
      url: `${k8sPrefix}/infrastructure/clusters/scaleWorkers/:id`,
      name: 'Infrastructure:Clusters:ScaleWorkers',
    }),
  },
  dashboard: Route.register({ url: `${k8sPrefix}/dashboard`, name: 'Dashboard' }),
  apiAccess: Route.register({ url: `${k8sPrefix}/api_access`, name: 'APIAccess' }),
  notifications: Route.register({ url: `${k8sPrefix}/notifications`, name: 'Notifications' }),
  nodes: {
    list: Route.register({ url: `${k8sPrefix}/infrastructure#nodes`, name: 'Nodes:List' }),
    detail: Route.register({ url: `${k8sPrefix}/infrastructure/nodes/:id`, name: 'Nodes:Details' }),
    download: Route.register({
      url: `${k8sPrefix}/infrastructure/nodes/cli/download`,
      name: 'Nodes:Download',
    }),
  },
  cloudProviders: {
    list: Route.register({
      url: `${k8sPrefix}/infrastructure#cloudProviders`,
      name: 'CloudProviders:List',
    }),
    edit: Route.register({
      url: `${k8sPrefix}/infrastructure/cloudProviders/edit/:id`,
      name: 'CloudProviders:Edit',
    }),
    add: Route.register({
      url: `${k8sPrefix}/infrastructure/cloudProviders/add`,
      name: 'CloudProviders:Add',
    }),
  },
  apps: {
    list: Route.register({ url: `${k8sPrefix}/apps`, name: 'Apps:List' }),
    detail: Route.register({
      url: `${k8sPrefix}/apps/:clusterId/:release/:id`,
      name: 'Apps:Details',
    }),
    deployed: Route.register({
      url: `${k8sPrefix}/apps/deployed/:clusterId/:release`,
      name: 'Apps:Deployed',
    }),
  },
  pods: {
    list: Route.register({ url: `${k8sPrefix}/pods#pods`, name: 'Pods:List' }),
    add: Route.register({ url: `${k8sPrefix}/pods/add`, name: 'Pods:Add' }),
  },
  services: {
    list: Route.register({ url: `${k8sPrefix}/pods#services`, name: 'Services:List' }),
    add: Route.register({ url: `${k8sPrefix}/pods/services/add`, name: 'Services:Add' }),
  },
  deployments: {
    list: Route.register({ url: `${k8sPrefix}/pods#deployments`, name: 'Deployments:List' }),
    add: Route.register({ url: `${k8sPrefix}/pods/deployments/add`, name: 'Deployments:Add' }),
  },
  storage: {
    list: Route.register({ url: `${k8sPrefix}/storage_classes`, name: 'Storage:List' }),
    add: Route.register({ url: `${k8sPrefix}/storage_classes/add`, name: 'Storage:Add' }),
  },
  logging: {
    list: Route.register({ url: `${k8sPrefix}/logging`, name: 'Logging:List' }),
    add: Route.register({ url: `${k8sPrefix}/logging/add`, name: 'Logging:Add' }),
    edit: Route.register({ url: `${k8sPrefix}/logging/edit/:id`, name: 'Logging:Edit' }),
  },
  namespaces: {
    list: Route.register({ url: `${k8sPrefix}/namespaces`, name: 'Namespaces:List' }),
    add: Route.register({ url: `${k8sPrefix}/namespaces/add`, name: 'Namespaces:Add' }),
  },
  userManagement: {
    users: Route.register({
      url: `${k8sPrefix}/user_management#users`,
      name: 'UserManagement:Users:List',
    }),
    tenants: Route.register({
      url: `${k8sPrefix}/user_management#tenants`,
      name: 'UserManagement:Tenants:List',
    }),
    addTenant: Route.register({
      url: `${k8sPrefix}/user_management/tenants/add`,
      name: 'UserManagement:Tenants:Add',
    }),
    editTenant: Route.register({
      url: `${k8sPrefix}/user_management/tenants/edit/:id`,
      name: 'UserManagement:Tenants:Edit',
    }),
    addUser: Route.register({
      url: `${k8sPrefix}/user_management/users/add`,
      name: 'UserManagement:User:Add',
    }),
    editUser: Route.register({
      url: `${k8sPrefix}/user_management/users/edit/:id`,
      name: 'UserManagement:User:Edit',
    }),
  },
  prometheus: {
    list: Route.register({ url: `${k8sPrefix}/prometheus`, name: 'Prometheus:List' }),
    add: Route.register({ url: `${k8sPrefix}/prometheus/instances/add`, name: 'Prometheus:Add' }),
    edit: Route.register({
      url: `${k8sPrefix}/prometheus/instances/edit/:id`,
      name: 'Prometheus:Edit',
    }),
    editRules: Route.register({
      url: `${k8sPrefix}/prometheus/rules/edit/:id`,
      name: 'Prometheus:Rules:Edit',
    }),
    editServiceMonitors: Route.register({
      url: `${k8sPrefix}/prometheus/serviceMonitors/edit/:id`,
      name: 'Prometheus:ServiceMonitors:Edit',
    }),
    editAlertManagers: Route.register({
      url: `${k8sPrefix}/prometheus/alertManagers/edit/:id`,
      name: 'Promtheus:AltertManagers:Edit',
    }),
  },
  rbac: {
    list: Route.register({ url: `${k8sPrefix}/rbac`, name: 'RBAC:List' }),
    addRoles: Route.register({ url: `${k8sPrefix}/rbac/roles/add`, name: 'RBAC:List' }),
    addClusterRoles: Route.register({
      url: `${k8sPrefix}/rbac/clusterroles/add`,
      name: 'RBAC:ClusterRoles:Add',
    }),
    addRoleBindings: Route.register({
      url: `${k8sPrefix}/rbac/rolebindings/add`,
      name: 'RBAC:RoleBindings:Add',
    }),
    editRoleBindings: Route.register({
      url: `${k8sPrefix}/rbac/rolebindings/edit/:id/cluster/:clusterId`,
      name: 'RBAC:RoleBindings:Edit',
    }),
    addClusterRoleBindings: Route.register({
      url: `${k8sPrefix}/rbac/clusterrolebindings/add`,
      name: 'RBAC:ClusterRolesBindings:Add',
    }),
    editRoles: Route.register({
      url: `${k8sPrefix}/rbac/roles/edit/:id/cluster/:clusterId`,
      name: 'RBAC:Roles:Edit',
    }),
    editClusterRoles: Route.register({
      url: `${k8sPrefix}/rbac/clusterroles/edit/:id/cluster/:clusterId`,
      name: 'RBAC:ClusterRoles:Edit',
    }),
    editClusterRoleBindings: Route.register({
      url: `${k8sPrefix}/rbac/clusterrolebindings/edit/:id/cluster/:clusterId`,
      name: 'RBAC:ClusterRoleBindings:Edit',
    }),
  },
  password: {
    reset: Route.register({ url: `${appUrlRoot}/reset/password/:id`, name: 'Password:Reset' }),
  },
}
/* eslint-enable max-len */
