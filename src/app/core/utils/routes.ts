import { AppPlugins, appUrlRoot, pluginRoutePrefix } from 'app/constants'
import URLPattern from 'url-pattern'

interface GenericKVP {
  [key: string]: string
}

interface IRouteOptions {
  url: string
  name: string
  defaultParams?: GenericKVP
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
  defaultParams: GenericKVP
  pattern: URLPattern

  static routes: Route[] = []

  constructor(options: IRouteOptions) {
    this.url = options.url
    this.name = options.name
    this.defaultParams = options.defaultParams || {}
    this.pattern = new URLPattern(options.url)
  }

  public path: RouterPathFn<T> = (params: OptionalParamType<T>) => {
    // @ts-ignore
    const allParams = { ...this.defaultParams, ...(params || {}) }
    return createUrlWithQueryString(new URL(this.url, window.location.origin), allParams)
  }

  public toString(prefix = ''): string {
    return this.path(null).replace(prefix, '')
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
}

/*
    createUrlWithQueryString(routes.cluster.edit, {id: 'asdf', name: 'fdsa'})
    produces /ui/kubernetes/infrastructure/clusters/edit/asdf?name=fdsa`,
  */
export function createUrlWithQueryString(url: URL | string, params?: GenericKVP) {
  if (!params || Object.keys(params || {}).length === 0) {
    if (typeof url === 'string') {
      return url
    }
    return url.toString().replace(url.origin, '')
  }
  if (typeof url === 'string') {
    url = new URL(url, window.location.origin)
  }

  const fields: GenericKVP = { ...params }

  // nice utility to reconstruct urls from objects / models
  // replace pathname variables (e.g. '/:id') with params when applicable
  if (url.pathname.includes(':')) {
    const matches = url.pathname.match(/:([0-9_a-z]+)/gi) || []
    matches.forEach((match) => {
      const key = match.replace(':', '')

      // dont replace if there isn't a substitution
      // @ts-ignore
      url.pathname = url.pathname.replace(match, fields[key] || match)
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

/* eslint-disable max-len */
export const routes = {
  cluster: {
    list: Route.register({
      url: `${pluginRoutePrefix}/infrastructure#clusters`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Infrastructure:Clusters:List',
    }),
    edit: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/clusters/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Infrastructure:Clusters:Edit',
    }),
    detail: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/clusters/:id#clusterDetails`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Infrastructure:Clusters:Details',
    }),
    nodes: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/clusters/:id#nodes`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Infrastructure:Clusters:Nodes',
    }),
    nodeHealth: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/clusters/:id#nodeHealth`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Infrastructure:Clusters:NodeHealth',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/clusters/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Infrastructure:Clusters:Add',
    }),
    addAws: {
      custom: Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/aws/add/custom`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:Clusters:AddAws:Custom',
      }),
      'one-click': Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/aws/add/one-click`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:Clusters:AddAws:OneClick',
      }),
    },
    addAzure: {
      custom: Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/azure/add/custom`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:Clusters:AddAzure:Custom',
      }),
      'one-click': Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/azure/add/one-click`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:Clusters:AddAzure:OneClick',
      }),
    },
    addBareOs: {
      virtual: {
        'one-click': Route.register({
          url: `${pluginRoutePrefix}/infrastructure/clusters/bareos/add/virtual/one-click`,
          defaultParams: {
            plugin: AppPlugins.Kubernetes,
          },
          name: 'Infrastructure:Clusters:AddBareOs:Virtual:OneClick',
        }),
        'single-master': Route.register({
          url: `${pluginRoutePrefix}/infrastructure/clusters/bareos/add/virtual/single-master`,
          defaultParams: {
            plugin: AppPlugins.Kubernetes,
          },
          name: 'Infrastructure:Clusters:AddBareOs:Virtual:SingleMaster',
        }),
        'multi-master': Route.register({
          url: `${pluginRoutePrefix}/infrastructure/clusters/bareos/add/virtual/multi-master`,
          defaultParams: {
            plugin: AppPlugins.Kubernetes,
          },
          name: 'Infrastructure:Clusters:AddBareOs:Virtual:MultiMaster',
        }),
      },
      physical: {
        'one-click': Route.register({
          url: `${pluginRoutePrefix}/infrastructure/clusters/bareos/add/physical/one-click`,
          defaultParams: {
            plugin: AppPlugins.Kubernetes,
          },
          name: 'Infrastructure:Clusters:AddBareOs:Physical:OneClick',
        }),
        'single-master': Route.register({
          url: `${pluginRoutePrefix}/infrastructure/clusters/bareos/add/physical/single-master`,
          defaultParams: {
            plugin: AppPlugins.Kubernetes,
          },
          name: 'Infrastructure:Clusters:AddBareOs:Physical:SingleMaster',
        }),
        'multi-master': Route.register({
          url: `${pluginRoutePrefix}/infrastructure/clusters/bareos/add/physical/multi-master`,
          defaultParams: {
            plugin: AppPlugins.Kubernetes,
          },
          name: 'Infrastructure:Clusters:AddBareOs:Physical:MultiMaster',
        }),
      },
    },
    scaleMasters: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/clusters/scaleMasters/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Infrastructure:Clusters:ScaleMasters',
    }),
    scaleWorkers: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/clusters/scaleWorkers/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Infrastructure:Clusters:ScaleWorkers',
    }),
  },
  dashboard: Route.register({
    url: `${pluginRoutePrefix}/dashboard`,
    name: 'Dashboard',
    defaultParams: {
      plugin: AppPlugins.Kubernetes,
    },
  }),
  apiAccess: Route.register({
    url: `${pluginRoutePrefix}/api_access`,
    name: 'APIAccess',
    defaultParams: {
      plugin: AppPlugins.Kubernetes,
    },
  }),
  notifications: Route.register({
    url: `${pluginRoutePrefix}/notifications`,
    name: 'Notifications',
    defaultParams: {
      plugin: AppPlugins.Kubernetes,
    },
  }),
  nodes: {
    list: Route.register({
      url: `${pluginRoutePrefix}/infrastructure#nodes`,
      name: 'Nodes:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    detail: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/nodes/:id`,
      name: 'Nodes:Details',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/nodes/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Nodes:Add',
    }),
  },
  cloudProviders: {
    list: Route.register({
      url: `${pluginRoutePrefix}/infrastructure#cloudProviders`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'CloudProviders:List',
    }),
    edit: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/cloudProviders/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'CloudProviders:Edit',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/infrastructure/cloudProviders/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'CloudProviders:Add',
    }),
  },
  apps: {
    list: Route.register({
      url: `${pluginRoutePrefix}/apps`,
      name: 'Apps:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    detail: Route.register({
      url: `${pluginRoutePrefix}/apps/:clusterId/:release/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Apps:Details',
    }),
    deployed: Route.register({
      url: `${pluginRoutePrefix}/apps/deployed/:clusterId/:release`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Apps:Deployed',
    }),
  },
  pods: {
    list: Route.register({
      url: `${pluginRoutePrefix}/workloads#pods`,
      name: 'Pods:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),

    add: Route.register({
      url: `${pluginRoutePrefix}/workloads/pods/add`,
      name: 'Pods:Add',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
  },
  services: {
    list: Route.register({
      url: `${pluginRoutePrefix}/workloads#services`,
      name: 'Services:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/workloads/services/add`,
      name: 'Services:Add',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
  },
  deployments: {
    list: Route.register({
      url: `${pluginRoutePrefix}/workloads#deployments`,
      name: 'Deployments:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/workloads/deployments/add`,
      name: 'Deployments:Add',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
  },
  namespaces: {
    list: Route.register({
      url: `${pluginRoutePrefix}/workloads#namespaces`,
      name: 'Namespaces:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/workloads/namespaces/add`,
      name: 'Namespaces:Add',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
  },
  storage: {
    list: Route.register({
      url: `${pluginRoutePrefix}/storage_classes`,
      name: 'Storage:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/storage_classes/add`,
      name: 'Storage:Add',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
  },
  logging: {
    list: Route.register({
      url: `${pluginRoutePrefix}/logging`,
      name: 'Logging:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/logging/add`,
      name: 'Logging:Add',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    edit: Route.register({
      url: `${pluginRoutePrefix}/logging/edit/:id`,
      name: 'Logging:Edit',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
  },
  userManagement: {
    root: Route.register({
      url: `${pluginRoutePrefix}/user_management`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'UserManagement:Root',
    }),
    users: Route.register({
      url: `${pluginRoutePrefix}/user_management#users`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'UserManagement:Users:List',
    }),
    tenants: Route.register({
      url: `${pluginRoutePrefix}/user_management#tenants`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'UserManagement:Tenants:List',
    }),
    addTenant: Route.register({
      url: `${pluginRoutePrefix}/user_management/tenants/add`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'UserManagement:Tenants:Add',
    }),
    editTenant: Route.register({
      url: `${pluginRoutePrefix}/user_management/tenants/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'UserManagement:Tenants:Edit',
    }),
    addUser: Route.register({
      url: `${pluginRoutePrefix}/user_management/users/add`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'UserManagement:User:Add',
    }),
    editUser: Route.register({
      url: `${pluginRoutePrefix}/user_management/users/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'UserManagement:User:Edit',
    }),
  },
  prometheus: {
    list: Route.register({
      url: `${pluginRoutePrefix}/prometheus`,
      name: 'Prometheus:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/prometheus/instances/add`,
      name: 'Prometheus:Add',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    edit: Route.register({
      url: `${pluginRoutePrefix}/prometheus/instances/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Prometheus:Edit',
    }),
    editRules: Route.register({
      url: `${pluginRoutePrefix}/prometheus/rules/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Prometheus:Rules:Edit',
    }),
    editServiceMonitors: Route.register({
      url: `${pluginRoutePrefix}/prometheus/serviceMonitors/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Prometheus:ServiceMonitors:Edit',
    }),
    editAlertManagers: Route.register({
      url: `${pluginRoutePrefix}/prometheus/alertManagers/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Promtheus:AltertManagers:Edit',
    }),
  },
  rbac: {
    list: Route.register({
      url: `${pluginRoutePrefix}/rbac`,
      name: 'RBAC:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    addRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac/roles/add`,
      name: 'RBAC:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    addClusterRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac/clusterroles/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRoles:Add',
    }),
    addRoleBindings: Route.register({
      url: `${pluginRoutePrefix}/rbac/rolebindings/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:RoleBindings:Add',
    }),
    editRoleBindings: Route.register({
      url: `${pluginRoutePrefix}/rbac/rolebindings/edit/:id/cluster/:clusterId`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:RoleBindings:Edit',
    }),
    addClusterRoleBindings: Route.register({
      url: `${pluginRoutePrefix}/rbac/clusterrolebindings/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRolesBindings:Add',
    }),
    editRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac/roles/edit/:id/cluster/:clusterId`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:Roles:Edit',
    }),
    editClusterRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac/clusterroles/edit/:id/cluster/:clusterId`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRoles:Edit',
    }),
    editClusterRoleBindings: Route.register({
      url: `${pluginRoutePrefix}/rbac/clusterrolebindings/edit/:id/cluster/:clusterId`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRoleBindings:Edit',
    }),
  },
  password: {
    reset: Route.register({ url: `${appUrlRoot}/reset/password/:id`, name: 'Password:Reset' }),
  },
}
/* eslint-enable max-len */
