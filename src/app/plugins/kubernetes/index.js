import React from 'react'

import AddCloudProviderPage from './components/infrastructure/AddCloudProviderPage'
import AddClusterPage from './components/infrastructure/AddClusterPage'
import AddDeploymentPage from './components/pods/AddDeploymentPage'
import AddNamespacePage from './components/namespaces/AddNamespacePage'
import AddPodPage from './components/pods/AddPodPage'
import AddServicePage from './components/pods/AddServicePage'
import ApiAccessPage from './components/apiAccess/ApiAccessPage'
import AppsIndexPage from './components/apps/AppsIndexPage'
import ClusterDetailsPage from './components/infrastructure/ClusterDetailsPage'
import InfrastructurePage from './components/infrastructure/InfrastructurePage'
import NamespacesListPage from './components/namespaces/NamespacesListPage'
import PodsIndexPage from './components/pods/PodsIndexPage'
import StorageClassesPage from './components/storage/StorageClassesPage'
import UpdateCloudProviderPage from './components/infrastructure/UpdateCloudProviderPage'
import UserManagementIndexPage from './components/userManagement/UserManagementIndexPage'
import AppDetailsPage from 'core/components/appCatalog/AppDetailsPage'

class Kubernetes extends React.Component {
  render () {
    return (
      <h1>Kubernetes Plugin</h1>
    )
  }
}

Kubernetes.__name__ = 'kubernetes'

Kubernetes.registerPlugin = pluginManager => {
  const plugin = pluginManager.registerPlugin(
    'kubernetes', 'Kubernetes', '/ui/kubernetes'
  )

  plugin.registerRoutes(
    [
      {
        name: 'Infrastructure',
        link: { path: '/infrastructure', exact: true, default: true },
        component: InfrastructurePage
      },
      {
        name: 'Create Cluster',
        link: { path: '/infrastructure/clusters/add', exact: true },
        component: AddClusterPage,
      },
      {
        name: 'Cluster Details',
        link: { path: '/infrastructure/clusters/:id', exact: true },
        component: ClusterDetailsPage,
      },
      {
        name: 'Create Cloud Provider',
        link: { path: '/infrastructure/cloudProviders/add', exact: true },
        component: AddCloudProviderPage
      },
      {
        name: 'Update Cloud Provider',
        link: { path: '/infrastructure/cloudProviders/edit/:id', exact: true },
        component: UpdateCloudProviderPage
      },
      {
        name: 'App Catalog',
        link: { path: '/apps', exact: true },
        component: AppsIndexPage
      },
      {
        name: 'App Details',
        link: { path: '/apps/:id', exact: true },
        component: AppDetailsPage,
      },
      {
        name: 'Pods, Deployments, Services',
        link: { path: '/pods', exact: true },
        component: PodsIndexPage
      },
      {
        name: 'Add Pod',
        link: { path: '/pods/add', exact: true },
        component: AddPodPage
      },
      {
        name: 'Add Deployment',
        link: { path: '/deployments/add', exact: true },
        component: AddDeploymentPage
      },
      {
        name: 'Add Service',
        link: { path: '/services/add', exact: true },
        component: AddServicePage
      },
      {
        name: 'Storage Classes',
        link: { path: '/storage_classes', exact: true },
        component: StorageClassesPage
      },
      {
        name: 'Namespaces',
        link: { path: '/namespaces', exact: true },
        component: NamespacesListPage
      },
      {
        name: 'Add Namespace',
        link: { path: '/namespaces/add', exact: true },
        component: AddNamespacePage
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

  plugin.registerNavItems(
    [
      {
        name: 'Infrastructure',
        link: { path: '/infrastructure' },
        nestedLinks: [
          { name: 'Clusters', link: { path: '/infrastructure#clusters' } },
          { name: 'Nodes', link: { path: '/infrastructure#nodes' } },
          { name: 'Cloud Providers', link: { path: '/infrastructure#cloudProviders' } },
        ]
      },
      {
        name: 'App Catalog',
        link: { path: '/apps' },
        nestedLinks: [
          { name: 'App Catalog', link: { path: '/apps#appCatalog' } },
          { name: 'Deployed Apps', link: { path: '/apps#deployedApps' } },
          { name: 'Repositories', link: { path: '/apps#repositories' } },
        ]
      },
      {
        name: 'Pods, Deployments, Services',
        link: { path: '/pods' },
        nestedLinks: [
          { name: 'Pods', link: { path: '/pods#pods' } },
          { name: 'Deployments', link: { path: '/pods#deployments' } },
          { name: 'Services', link: { path: '/pods#services' } },
        ]
      },
      { name: 'Storage Classes', link: { path: '/storage_classes' } },
      { name: 'Namespaces', link: { path: '/namespaces' } },
      { name: 'API Access', link: { path: '/api_access' } },
      {
        name: 'Tenants & Users',
        link: { path: '/user_management' },
        nestedLinks: [
          { name: 'Tenants', link: { path: '/user_management#tenants' } },
          { name: 'Users', link: { path: '/user_management#users' } },
          { name: 'Groups', link: { path: '/user_management#userGroups' } },
          { name: 'Roles', link: { path: '/user_management#roles' } },
        ]
      },
    ]
  )
}

export default Kubernetes
