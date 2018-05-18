import React from 'react'
import k8Schema from './api/schema/schema'

import ClustersListContainer from './components/clusters/ClustersListContainer'

class Kubernetes extends React.Component {
  render () {
    return (
      <h1>Kubernetes Plugin</h1>
    )
  }
}

Kubernetes.__name__ = 'kubernetes'

Kubernetes.registerPlugin = pluginManager => {
  pluginManager.registerRoutes(
    '/ui/kubernetes',
    [
      {
        name: 'Clusters',
        link: { path: '/clusters', exact: true },
        component: ClustersListContainer
      },
    ]
  )

  pluginManager.registerNavItems(
    '/ui/kubernetes',
    [
      {
        name: 'Clusters',
        link: { path: '/clusters' }
      },
    ]
  )

  pluginManager.registerSchema(k8Schema)
}

export default Kubernetes
