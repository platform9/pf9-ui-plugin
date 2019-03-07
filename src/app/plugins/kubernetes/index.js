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

  const hostPrefix = '' // set to another host during development
  const clarityBase = path => `${hostPrefix}/clarity/index.html#${path}`
  const clarityLink = path => ({ link: { path: clarityBase(path), external: true } })

  // For development we can set this manually
  const useClarityLinks = window.localStorage.disableClarityLinks !== 'true'

  // These nav items will redirect to the old "clarity" UI while the new UI is under development.
  const clarityNavItems = [
    {
      name: 'Infrastructure',
      ...clarityLink('/infrastructureK8s'),
      icon: 'building',
      nestedLinks: [
        { name: 'Clusters', ...clarityLink('/infrastructureK8s#clusters') },
        { name: 'Nodes', ...clarityLink('/infrastructureK8s#nodes') },
        { name: 'Cloud Providers', ...clarityLink('/infrastructureK8s#cps') },
      ]
    },
    {
      name: 'App Catalog',
      ...clarityLink('/kubernetes/apps'),
      icon: 'th',
      nestedLinks: [
        { name: 'App Catalog', ...clarityLink('/kubernetes/apps#catalog') },
        { name: 'Deployed Apps', ...clarityLink('/kubernetes/apps#deployed_apps') },
        { name: 'Repositories', ...clarityLink('/kubernetes/apps#repositories') },
      ]
    },
    {
      name: 'Pods, Deployments, Services',
      ...clarityLink('/podsK8s'),
      icon: 'cubes',
      nestedLinks: [
        { name: 'Pods', ...clarityLink('/podsK8s#pods') },
        { name: 'Deployments', ...clarityLink('/podsK8s#deployments') },
        { name: 'Services', ...clarityLink('/podsK8s#services') },
      ]
    },
    { name: 'Storage Classes', icon: 'hdd', ...clarityLink('/kubernetes/storage_classes') },
    { name: 'Namespaces', icon: 'object-group', ...clarityLink('/kubernetes/namespaces') },
    { name: 'API Access', icon: 'key', ...clarityLink('/kubernetes/api_access') },
    {
      name: 'Tenants & Users',
      icon: 'user',
      ...clarityLink('/kubernetes/users'),
      nestedLinks: [
        { name: 'Tenants', ...clarityLink('/kubernetes/users#tenants') },
        { name: 'Users', ...clarityLink('/kubernetes/users#users') },
        { name: 'Groups', ...clarityLink('/kubernetes/users#groups') },
        { name: 'Roles', ...clarityLink('/kubernetes/users#roles') },
      ]
    },
  ]

  // These nav items are in active development but not shown in production.
  const devNavItems = [
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

  const links = useClarityLinks ? clarityNavItems : devNavItems
  plugin.registerNavItems(links)
}

export default Kubernetes
