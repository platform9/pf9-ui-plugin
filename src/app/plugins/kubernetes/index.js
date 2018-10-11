import React from 'react'

import InfrastructurePage from './components/infrastructure/InfrastructurePage'
import AddCloudProviderPage from './components/infrastructure/AddCloudProviderPage'
import AppsIndexPage from './components/apps/AppsIndexPage'
import PodsIndexPage from './components/pods/PodsIndexPage'
import StorageClassesPage from './components/storage/StorageClassesPage'
import NamespacesPage from './components/namespaces/NamespacesPage'
import ApiAccessPage from './components/apiAccess/ApiAccessPage'
import UserManagementIndexPage from './components/userManagement/UserManagementIndexPage'

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
        name: 'Infrastructure',
        link: { path: '/infrastructure', exact: true },
        component: InfrastructurePage
      },
      {
        name: 'Create Cloud Provider',
        link: { path: '/infrastructure/cloudProviders/add', exact: true },
        component: AddCloudProviderPage
      },
      {
        name: 'App Catalog',
        link: { path: '/apps', exact: true },
        component: AppsIndexPage
      },
      {
        name: 'Pods, Deployments, Services',
        link: { path: '/pods', exact: true },
        component: PodsIndexPage
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
      {
        name: 'API Access',
        link: { path: '/api_access', exact: true },
        component: ApiAccessPage
      },
      {
        name: 'Tenants & Users',
        link: { path: '/user_management', exact: true },
        component: UserManagementIndexPage
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
      { name: 'API Access', link: { path: '/api_access' } },
      { name: 'Tenants & Users', link: { path: '/user_management' } },
    ]
  )
}

export default Kubernetes
