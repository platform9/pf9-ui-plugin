import { AppPlugins, appUrlRoot, pluginRoutePrefix } from 'app/constants'
import { VirtualMachineCreateTypes } from 'k8s/components/virtual-machines/model'
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
  static register<T extends OptionalGenericKVP = null>(routeOptions: IRouteOptions): Route<T> {
    const route = new Route<T>(routeOptions)
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
  login: Route.register({
    url: `${appUrlRoot}/login`,
    name: 'Login',
  }),
  infrastructure: Route.register({
    url: `${pluginRoutePrefix}/infrastructure`,
    defaultParams: {
      plugin: AppPlugins.Kubernetes,
    },
    name: 'Infrastructure:Clusters:List',
  }),
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
    import: {
      root: Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/import`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:Clusters:Import',
      }),
      eks: Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/import/eks`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:Clusters:Import:EKS',
      }),
      aks: Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/import/aks`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:Clusters:Import:AKS',
      }),
      gke: Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/import/gke`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:Clusters:Import:GKE',
      }),
    },
    imported: {
      list: Route.register({
        url: `${pluginRoutePrefix}/infrastructure#importedClusters`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:ImportedClusters:List',
      }),
      details: Route.register({
        url: `${pluginRoutePrefix}/infrastructure/clusters/imported/:id`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Infrastructure:ImportedClusters:ClusterDetails',
      }),
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
  apiAccess: {
    api: Route.register({
      url: `${pluginRoutePrefix}/api-access`,
      name: 'ApiAccess:API',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    apiServices: Route.register({
      url: `${pluginRoutePrefix}/api-access#api-services`,
      name: 'ApiAccess:APIServices',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    kubeConfig: Route.register({
      url: `${pluginRoutePrefix}/api-access#kubeconfig`,
      name: 'ApiAccess:KubeConfig',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    terraform: Route.register({
      url: `${pluginRoutePrefix}/api-access#terraform`,
      name: 'ApiAccess:Terraform',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
  },
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
  virtualMachines: {
    list: Route.register({
      url: `${pluginRoutePrefix}/virtual-machines`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'VirtualMachines:List',
    }),
    detail: Route.register<{ clusterId: string; namespace: string; name: string }>({
      url: `${pluginRoutePrefix}/virtual-machines/:clusterId/:namespace/:name`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'VirtualMachines:Detail',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/virtual-machines/add/new`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
        createType: VirtualMachineCreateTypes.AddNew,
      },
      name: 'VirtualMachines:Add:NewVM',
    }),
    import: {
      url: Route.register({
        url: `${pluginRoutePrefix}/virtual-machines/import/url`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
          createType: VirtualMachineCreateTypes.ImportURL,
        },
        name: 'VirtualMachines:Import:URL',
      }),
      disk: Route.register({
        url: `${pluginRoutePrefix}/virtual-machines/import/disk`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
          createType: VirtualMachineCreateTypes.ImportDisk,
        },
        name: 'VirtualMachines:Import:Disk',
      }),
    },
    clone: {
      pvc: Route.register({
        url: `${pluginRoutePrefix}/virtual-machines/clone/pvc`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
          createType: VirtualMachineCreateTypes.ClonePVC,
        },
        name: 'VirtualMachines:Clone:PVC',
      }),
    },
  },
  workloads: Route.register({
    url: `${pluginRoutePrefix}/workloads`,
    defaultParams: {
      plugin: AppPlugins.Kubernetes,
    },
    name: 'Workloads:Pods:List',
  }),
  apps: {
    list: Route.register({
      url: `${pluginRoutePrefix}/apps`,
      name: 'Apps:List',
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
    }),
    deploy: Route.register({
      url: `${pluginRoutePrefix}/apps/deploy/:repository/:name`,
      name: 'Apps:Deploy',
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
    deployed: {
      list: Route.register({
        url: `${pluginRoutePrefix}/apps/deployed/:clusterId/:release`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'Apps:Deployed',
      }),
      edit: Route.register({
        url: `${pluginRoutePrefix}/apps/deployed/edit/:clusterId/:namespace/:name`,
        name: 'Apps:Edit',
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
      }),
    },
  },
  repositories: {
    list: Route.register({
      url: `${pluginRoutePrefix}/apps#repositories`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Repositories:List',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/apps/repositories/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Repositories:Add',
    }),
    edit: Route.register({
      url: `${pluginRoutePrefix}/apps/repositories/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Repositories:Edit',
    }),
  },
  pods: {
    list: Route.register({
      url: `${pluginRoutePrefix}/workloads#pods`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Pods:List',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/workloads/pods/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Pods:Add',
    }),
  },
  services: {
    list: Route.register({
      url: `${pluginRoutePrefix}/workloads#services`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Services:List',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/workloads/services/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Services:Add',
    }),
  },
  deployments: {
    list: Route.register({
      url: `${pluginRoutePrefix}/workloads#deployments`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Deployments:List',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/workloads/deployments/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Deployments:Add',
    }),
  },
  namespaces: {
    list: Route.register({
      url: `${pluginRoutePrefix}/workloads#namespaces`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Namespaces:List',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/workloads/namespaces/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Namespaces:Add',
    }),
  },
  storage: {
    root: Route.register({
      url: `${pluginRoutePrefix}/storage_classes`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'StorageClasses:List',
    }),
    list: Route.register({
      url: `${pluginRoutePrefix}/storage_classes#storage`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'StorageClasses:List',
    }),
    add: Route.register({
      url: `${pluginRoutePrefix}/storage_classes/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'StorageClasses:Add',
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
  accountStatus: {
    root: Route.register({
      url: `${pluginRoutePrefix}/status`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'AccountStatus:Root',
    }),
  },
  userSettings: {
    root: Route.register({
      url: `${pluginRoutePrefix}/user_settings`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'UserSettings:Root',
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
  sso: {
    root: Route.register({
      url: `${pluginRoutePrefix}/sso`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'SsoManagement:Root',
    }),
    sso: Route.register({
      url: `${pluginRoutePrefix}/sso#sso`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'SsoManagement:Sso',
    }),
    groups: Route.register({
      url: `${pluginRoutePrefix}/sso#groups`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'SsoManagement:Groups',
    }),
    addGroup: Route.register({
      url: `${pluginRoutePrefix}/sso/groups/add`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'SsoManagement:Group:Add',
    }),
    editGroup: Route.register({
      url: `${pluginRoutePrefix}/sso/groups/edit/:id`,
      defaultParams: {
        plugin: AppPlugins.MyAccount,
      },
      name: 'SsoManagement:Group:Edit',
    }),
  },
  customTheme: Route.register({
    url: `${pluginRoutePrefix}/theme`,
    defaultParams: {
      plugin: AppPlugins.MyAccount,
    },
    name: 'CustomTheme',
  }),
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
  monitoring: {
    root: Route.register({
      url: `${pluginRoutePrefix}/alarms`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Monitoring:Alarms:List',
    }),
    overview: Route.register({
      url: `${pluginRoutePrefix}/alarms#overview`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Monitoring:Overview',
    }),
    alarms: Route.register({
      url: `${pluginRoutePrefix}/alarms#alarms`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Monitoring:Alarms:List',
    }),
    rules: Route.register({
      url: `${pluginRoutePrefix}/alarms#rules`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'Monitoring:Rules:List',
    }),
  },
  rbac: {
    root: Route.register({
      url: `${pluginRoutePrefix}/rbac`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:Roles:List',
    }),
    roles: Route.register({
      url: `${pluginRoutePrefix}/rbac#roles`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:Roles:List',
    }),
    addRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac/roles/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:Roles:Add',
    }),
    editRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac/roles/edit/:id/cluster/:clusterId`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:Roles:Edit',
    }),
    clusterRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac#clusterRoles`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRoles:List',
    }),
    addClusterRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac/clusterroles/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRoles:Add',
    }),
    editClusterRoles: Route.register({
      url: `${pluginRoutePrefix}/rbac/clusterroles/edit/:id/cluster/:clusterId`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRoles:Edit',
    }),
    roleBindings: Route.register({
      url: `${pluginRoutePrefix}/rbac#roleBindings`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:RoleBindings:List',
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
    clusterRoleBindings: Route.register({
      url: `${pluginRoutePrefix}/rbac#clusterRoleBindings`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRoleBindings:List',
    }),
    addClusterRoleBindings: Route.register({
      url: `${pluginRoutePrefix}/rbac/clusterrolebindings/add`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRolesBindings:Add',
    }),
    editClusterRoleBindings: Route.register({
      url: `${pluginRoutePrefix}/rbac/clusterrolebindings/edit/:id/cluster/:clusterId`,
      defaultParams: {
        plugin: AppPlugins.Kubernetes,
      },
      name: 'RBAC:ClusterRoleBindings:Edit',
    }),
    profiles: {
      list: Route.register({
        url: `${pluginRoutePrefix}/rbac_profiles`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'RBAC:RbacProfiles:List',
      }),
      add: Route.register({
        url: `${pluginRoutePrefix}/rbac_profiles/add`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'RBAC:RbacProfiles:Add',
      }),
      deploy: Route.register({
        url: `${pluginRoutePrefix}/rbac_profiles/deploy/:name`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'RBAC:RbacProfiles:Deploy',
      }),
      profiles: Route.register({
        url: `${pluginRoutePrefix}/rbac_profiles#profiles`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'RBAC:RbacProfiles:List',
      }),
      drift: Route.register({
        url: `${pluginRoutePrefix}/rbac_profiles#drift`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'RBAC:RbacProfiles:List',
      }),
      edit: Route.register({
        url: `${pluginRoutePrefix}/rbac_profiles/edit/:id`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'RBAC:RbacProfiles:Edit',
      }),
      deleteBindings: Route.register({
        url: `${pluginRoutePrefix}/rbac_profiles/delete_bindings/:name`,
        defaultParams: {
          plugin: AppPlugins.Kubernetes,
        },
        name: 'RBAC:RbacProfiles:DeleteBindings',
      }),
    },
  },
  password: {
    reset: Route.register({ url: `${appUrlRoot}/reset/password`, name: 'Password:Reset' }),
  },
  help: Route.register({
    url: `${appUrlRoot}/help`,
    name: 'Help',
  }),
  ironicSetup: Route.register({
    url: `${pluginRoutePrefix}/setup`,
    defaultParams: {
      plugin: AppPlugins.BareMetal,
    },
    name: 'BareMetal:Setup',
  }),
}
/* eslint-enable max-len */
