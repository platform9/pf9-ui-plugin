const ApiResources = {
  // This is only a small fraction of what exists
  getApiGroupList: () => {
    return [
      {
        'name': 'extensions',
        'versions': [
          {
            'groupVersion': 'extensions/v1beta1',
            'version': 'v1beta1'
          }
        ],
        'preferredVersion': {
          'groupVersion': 'extensions/v1beta1',
          'version': 'v1beta1'
        }
      },
      {
        'name': 'apps',
        'versions': [
          {
            'groupVersion': 'apps/v1',
            'version': 'v1'
          },
          {
            'groupVersion': 'apps/v1beta2',
            'version': 'v1beta2'
          },
          {
            'groupVersion': 'apps/v1beta1',
            'version': 'v1beta1'
          }
        ],
        'preferredVersion': {
          'groupVersion': 'apps/v1',
          'version': 'v1'
        }
      }
    ]
  },

  getExtensionsApiResources: () => {
    return [
      {
        'name': 'daemonsets',
        'singularName': '',
        'namespaced': true,
        'kind': 'DaemonSet',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'ds'
        ]
      },
      {
        'name': 'daemonsets/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'DaemonSet',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'deployments',
        'singularName': '',
        'namespaced': true,
        'kind': 'Deployment',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'deploy'
        ]
      },
      {
        'name': 'deployments/rollback',
        'singularName': '',
        'namespaced': true,
        'kind': 'DeploymentRollback',
        'verbs': [
          'create'
        ]
      },
      {
        'name': 'deployments/scale',
        'singularName': '',
        'namespaced': true,
        'group': 'extensions',
        'version': 'v1beta1',
        'kind': 'Scale',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'deployments/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'Deployment',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'ingresses',
        'singularName': '',
        'namespaced': true,
        'kind': 'Ingress',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'ing'
        ]
      },
      {
        'name': 'ingresses/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'Ingress',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'networkpolicies',
        'singularName': '',
        'namespaced': true,
        'kind': 'NetworkPolicy',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'netpol'
        ]
      },
      {
        'name': 'podsecuritypolicies',
        'singularName': '',
        'namespaced': false,
        'kind': 'PodSecurityPolicy',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'psp'
        ]
      },
      {
        'name': 'replicasets',
        'singularName': '',
        'namespaced': true,
        'kind': 'ReplicaSet',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'rs'
        ]
      },
      {
        'name': 'replicasets/scale',
        'singularName': '',
        'namespaced': true,
        'group': 'extensions',
        'version': 'v1beta1',
        'kind': 'Scale',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'replicasets/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'ReplicaSet',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'replicationcontrollers',
        'singularName': '',
        'namespaced': true,
        'kind': 'ReplicationControllerDummy',
        'verbs': []
      },
      {
        'name': 'replicationcontrollers/scale',
        'singularName': '',
        'namespaced': true,
        'kind': 'Scale',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      }
    ]
  },

  getAppsApiResources: () => {
    return [
      {
        'name': 'controllerrevisions',
        'singularName': '',
        'namespaced': true,
        'kind': 'ControllerRevision',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ]
      },
      {
        'name': 'daemonsets',
        'singularName': '',
        'namespaced': true,
        'kind': 'DaemonSet',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'ds'
        ],
        'categories': [
          'all'
        ]
      },
      {
        'name': 'daemonsets/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'DaemonSet',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'deployments',
        'singularName': '',
        'namespaced': true,
        'kind': 'Deployment',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'deploy'
        ],
        'categories': [
          'all'
        ]
      },
      {
        'name': 'deployments/scale',
        'singularName': '',
        'namespaced': true,
        'group': 'autoscaling',
        'version': 'v1',
        'kind': 'Scale',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'deployments/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'Deployment',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'replicasets',
        'singularName': '',
        'namespaced': true,
        'kind': 'ReplicaSet',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'rs'
        ],
        'categories': [
          'all'
        ]
      },
      {
        'name': 'replicasets/scale',
        'singularName': '',
        'namespaced': true,
        'group': 'autoscaling',
        'version': 'v1',
        'kind': 'Scale',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'replicasets/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'ReplicaSet',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'statefulsets',
        'singularName': '',
        'namespaced': true,
        'kind': 'StatefulSet',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'sts'
        ],
        'categories': [
          'all'
        ]
      },
      {
        'name': 'statefulsets/scale',
        'singularName': '',
        'namespaced': true,
        'group': 'autoscaling',
        'version': 'v1',
        'kind': 'Scale',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'statefulsets/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'StatefulSet',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      }
    ]
  },

  getCoreApiResources: () => {
    return [
      {
        'name': 'bindings',
        'singularName': '',
        'namespaced': true,
        'kind': 'Binding',
        'verbs': [
          'create'
        ]
      },
      {
        'name': 'componentstatuses',
        'singularName': '',
        'namespaced': false,
        'kind': 'ComponentStatus',
        'verbs': [
          'get',
          'list'
        ],
        'shortNames': [
          'cs'
        ]
      },
      {
        'name': 'configmaps',
        'singularName': '',
        'namespaced': true,
        'kind': 'ConfigMap',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'cm'
        ]
      },
      {
        'name': 'endpoints',
        'singularName': '',
        'namespaced': true,
        'kind': 'Endpoints',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'ep'
        ]
      },
      {
        'name': 'events',
        'singularName': '',
        'namespaced': true,
        'kind': 'Event',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'ev'
        ]
      },
      {
        'name': 'limitranges',
        'singularName': '',
        'namespaced': true,
        'kind': 'LimitRange',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'limits'
        ]
      },
      {
        'name': 'namespaces',
        'singularName': '',
        'namespaced': false,
        'kind': 'Namespace',
        'verbs': [
          'create',
          'delete',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'ns'
        ]
      },
      {
        'name': 'namespaces/finalize',
        'singularName': '',
        'namespaced': false,
        'kind': 'Namespace',
        'verbs': [
          'update'
        ]
      },
      {
        'name': 'namespaces/status',
        'singularName': '',
        'namespaced': false,
        'kind': 'Namespace',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'nodes',
        'singularName': '',
        'namespaced': false,
        'kind': 'Node',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'no'
        ]
      },
      {
        'name': 'nodes/proxy',
        'singularName': '',
        'namespaced': false,
        'kind': 'NodeProxyOptions',
        'verbs': [
          'create',
          'delete',
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'nodes/status',
        'singularName': '',
        'namespaced': false,
        'kind': 'Node',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'persistentvolumeclaims',
        'singularName': '',
        'namespaced': true,
        'kind': 'PersistentVolumeClaim',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'pvc'
        ]
      },
      {
        'name': 'persistentvolumeclaims/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'PersistentVolumeClaim',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'persistentvolumes',
        'singularName': '',
        'namespaced': false,
        'kind': 'PersistentVolume',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'pv'
        ]
      },
      {
        'name': 'persistentvolumes/status',
        'singularName': '',
        'namespaced': false,
        'kind': 'PersistentVolume',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'pods',
        'singularName': '',
        'namespaced': true,
        'kind': 'Pod',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'po'
        ],
        'categories': [
          'all'
        ]
      },
      {
        'name': 'pods/attach',
        'singularName': '',
        'namespaced': true,
        'kind': 'PodAttachOptions',
        'verbs': [
          'create',
          'get'
        ]
      },
      {
        'name': 'pods/binding',
        'singularName': '',
        'namespaced': true,
        'kind': 'Binding',
        'verbs': [
          'create'
        ]
      },
      {
        'name': 'pods/eviction',
        'singularName': '',
        'namespaced': true,
        'group': 'policy',
        'version': 'v1beta1',
        'kind': 'Eviction',
        'verbs': [
          'create'
        ]
      },
      {
        'name': 'pods/exec',
        'singularName': '',
        'namespaced': true,
        'kind': 'PodExecOptions',
        'verbs': [
          'create',
          'get'
        ]
      },
      {
        'name': 'pods/log',
        'singularName': '',
        'namespaced': true,
        'kind': 'Pod',
        'verbs': [
          'get'
        ]
      },
      {
        'name': 'pods/portforward',
        'singularName': '',
        'namespaced': true,
        'kind': 'PodPortForwardOptions',
        'verbs': [
          'create',
          'get'
        ]
      },
      {
        'name': 'pods/proxy',
        'singularName': '',
        'namespaced': true,
        'kind': 'PodProxyOptions',
        'verbs': [
          'create',
          'delete',
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'pods/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'Pod',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'podtemplates',
        'singularName': '',
        'namespaced': true,
        'kind': 'PodTemplate',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ]
      },
      {
        'name': 'replicationcontrollers',
        'singularName': '',
        'namespaced': true,
        'kind': 'ReplicationController',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'rc'
        ],
        'categories': [
          'all'
        ]
      },
      {
        'name': 'replicationcontrollers/scale',
        'singularName': '',
        'namespaced': true,
        'group': 'autoscaling',
        'version': 'v1',
        'kind': 'Scale',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'replicationcontrollers/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'ReplicationController',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'resourcequotas',
        'singularName': '',
        'namespaced': true,
        'kind': 'ResourceQuota',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'quota'
        ]
      },
      {
        'name': 'resourcequotas/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'ResourceQuota',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'secrets',
        'singularName': '',
        'namespaced': true,
        'kind': 'Secret',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ]
      },
      {
        'name': 'serviceaccounts',
        'singularName': '',
        'namespaced': true,
        'kind': 'ServiceAccount',
        'verbs': [
          'create',
          'delete',
          'deletecollection',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'sa'
        ]
      },
      {
        'name': 'services',
        'singularName': '',
        'namespaced': true,
        'kind': 'Service',
        'verbs': [
          'create',
          'delete',
          'get',
          'list',
          'patch',
          'update',
          'watch'
        ],
        'shortNames': [
          'svc'
        ],
        'categories': [
          'all'
        ]
      },
      {
        'name': 'services/proxy',
        'singularName': '',
        'namespaced': true,
        'kind': 'ServiceProxyOptions',
        'verbs': [
          'create',
          'delete',
          'get',
          'patch',
          'update'
        ]
      },
      {
        'name': 'services/status',
        'singularName': '',
        'namespaced': true,
        'kind': 'Service',
        'verbs': [
          'get',
          'patch',
          'update'
        ]
      }
    ]
  }
}

export default ApiResources
