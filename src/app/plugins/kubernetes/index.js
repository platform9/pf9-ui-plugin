import React from 'react'

class Kubernetes extends React.Component {
  render () {
    return (
      <h1>Kubernetes Plugin</h1>
    )
  }
}

Kubernetes.__name__ = 'kubernetes'

const InfrastructurePage = () => <h1>Infrastructure Page</h1>
const AppCatalogPage = () => <h1>App Catalog Page</h1>
const PodsPage = () => <h1>Pods, Deployments, Services Page</h1>
const StorageClassesPage = () => <h1>Storage Classes Page</h1>
const NamespacesPage = () => <h1>Namespaces Page</h1>

Kubernetes.registerPlugin = pluginManager => {
  pluginManager.registerRoutes(
    '/ui/kubernetes',
    [
      {
        name: 'Infrastructure',
        link: { path: '/infrastructure', exact: true },
        component: InfrastructurePage
      },
      {
        name: 'App Catalog',
        link: { path: '/apps', exact: true },
        component: AppCatalogPage
      },
      {
        name: 'Pods, Deployments, Services',
        link: { path: '/pods', exact: true },
        component: PodsPage
      },
      {
        name: 'Storage Classes',
        link: { path: '/storage_classes', exact: true },
        component: StorageClassesPage
      },
      {
        name: 'Namespaces',
        link: { path: '/namespaces', exact: true },
        component: NamespacesPage
      },
    ]
  )

  pluginManager.registerNavItems(
    '/ui/kubernetes',
    [
      { name: 'Infrastructure', link: { path: '/infrastructure' } },
      { name: 'App Catalog', link: { path: '/apps' } },
      { name: 'Pods, Deployments, Services', link: { path: '/pods' } },
      { name: 'Storage Classes', link: { path: '/storage_classes' } },
      { name: 'Namespaces', link: { path: '/namespaces' } },
    ]
  )
}

export default Kubernetes
