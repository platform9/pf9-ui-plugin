import React from 'react'
import AddCloudProviderPage from './components/infrastructure/cloudProviders/AddCloudProviderPage'
import AddAwsClusterPage from './components/infrastructure/clusters/AddAwsClusterPage'
import AddAzureClusterPage from './components/infrastructure/clusters/AddAzureClusterPage'
import AddClusterPage from './components/infrastructure/clusters/AddClusterPage'
import AddBareOsClusterPage from './components/infrastructure/clusters/bareos/AddBareOsClusterPage'
import AddNamespacePage from './components/namespaces/AddNamespacePage'
import ApiAccessPage from './components/apiAccess/ApiAccessPage'
import AppsIndexPage from './components/apps/AppsIndexPage'
import ClusterDetailsPage from './components/infrastructure/clusters/ClusterDetailsPage'
import InfrastructurePage from './components/infrastructure/InfrastructurePage'
import NamespacesListPage from './components/namespaces/NamespacesListPage'
import OnboardingPage from './components/onboarding/OnboardingPage'
import PodsIndexPage from './components/pods/PodsIndexPage'
import StorageClassesPage from './components/storage/StorageClassesPage'
import UpdateCloudProviderPage
  from './components/infrastructure/cloudProviders/UpdateCloudProviderPage'
import StorageClassesAddPage from './components/storage/AddStorageClassPage'
import UserManagementIndexPage from './components/userManagement/UserManagementIndexPage'
import AppDetailsPage from 'k8s/components/apps/AppDetailsPage'
import AddPrometheusInstancePage from './components/prometheus/AddPrometheusInstancePage'
import PrometheusMonitoringPage from './components/prometheus/PrometheusMonitoringPage'
import UpdatePrometheusInstancePage from './components/prometheus/UpdatePrometheusInstancePage'
import UpdatePrometheusRulePage from './components/prometheus/UpdatePrometheusRulePage'
import UpdatePrometheusServiceMonitorPage from './components/prometheus/UpdateServiceMonitorPage'
import UpdatePrometheusAlertManagerPage
  from './components/prometheus/UpdatePrometheusAlertManagerPage'
import LoggingIndexPage from './components/logging/LoggingIndexPage'
import LoggingAddPage from './components/logging/LoggingAddPage'
import LoggingEditPage from './components/logging/LoggingEditPage'
// import config from '../../../../config'
import DashboardPage from './components/dashboard/DashboardPage'
import AddResourcePage from 'k8s/components/pods/AddResourcePage'
import DeployedAppDetailsPage from 'k8s/components/apps/DeployedAppDetailsPage'
import AddTenantPage from 'k8s/components/userManagement/tenants/AddTenantPage'

class Kubernetes extends React.PureComponent {
  render () {
    return (
      <h1>Kubernetes Plugin</h1>
    )
  }
}

Kubernetes.__name__ = 'kubernetes'

Kubernetes.registerPlugin = pluginManager => {
  const plugin = pluginManager.registerPlugin(
    'kubernetes', 'Kubernetes', '/ui/kubernetes',
  )

  plugin.registerRoutes(
    [
      {
        name: 'Dashboard',
        link: { path: '/dashboard', exact: true, default: true },
        component: DashboardPage,
      },
      {
        name: 'Infrastructure',
        link: { path: '/infrastructure', exact: true },
        component: InfrastructurePage,
      },
      {
        name: 'Create Cluster',
        link: { path: '/infrastructure/clusters/add', exact: true },
        component: AddClusterPage,
      },
      {
        name: 'Create AWS Cluster',
        link: { path: '/infrastructure/clusters/addAws', exact: true },
        component: AddAwsClusterPage,
      },
      {
        name: 'Create Azure Cluster',
        link: { path: '/infrastructure/clusters/addAzure', exact: true },
        component: AddAzureClusterPage,
      },
      {
        name: 'Create Bare OS Cluster',
        link: { path: '/infrastructure/clusters/addBareOs', exact: true },
        component: AddBareOsClusterPage,
      },
      {
        name: 'Cluster Details',
        link: { path: '/infrastructure/clusters/:id', exact: true },
        component: ClusterDetailsPage,
      },
      {
        name: 'Create Cloud Provider',
        link: { path: '/infrastructure/cloudProviders/add', exact: true },
        component: AddCloudProviderPage,
      },
      {
        name: 'Update Cloud Provider',
        link: { path: '/infrastructure/cloudProviders/edit/:id', exact: true },
        component: UpdateCloudProviderPage,
      },
      {
        name: 'App Catalog',
        link: { path: '/apps', exact: true },
        component: AppsIndexPage,
      },
      {
        name: 'Deployed App Details',
        link: { path: '/apps/deployed/:clusterId/:release', exact: true },
        component: DeployedAppDetailsPage,
      },
      {
        name: 'App Details',
        link: { path: '/apps/:clusterId/:release/:id', exact: true },
        component: AppDetailsPage,
      },
      {
        name: 'Pods, Deployments, Services',
        link: { path: '/pods', exact: true },
        component: PodsIndexPage,
      },
      {
        name: 'Add Pod',
        link: { path: '/pods/add', exact: true },
        component: () => <AddResourcePage resourceType="pod" />,
      },
      {
        name: 'Add Deployment',
        link: { path: '/pods/deployments/add', exact: true },
        component: () => <AddResourcePage resourceType="deployment" />,
      },
      {
        name: 'Add Service',
        link: { path: '/pods/services/add', exact: true },
        component: () => <AddResourcePage resourceType="service" />,
      },
      {
        name: 'Storage Classes',
        link: { path: '/storage_classes', exact: true },
        component: StorageClassesPage,
      },
      {
        name: 'Add Storage Class',
        link: { path: '/storage_classes/add', exact: true },
        component: StorageClassesAddPage,
      },
      {
        name: 'Namespaces',
        link: { path: '/namespaces', exact: true },
        component: NamespacesListPage,
      },
      {
        name: 'Prometheus Monitoring (BETA)',
        link: { path: '/prometheus', exact: true },
        component: PrometheusMonitoringPage,
      },
      {
        name: 'Logging (beta)',
        link: { path: '/logging', exact: true },
        component: LoggingIndexPage,
      },
      {
        name: 'Add Logging',
        link: { path: '/logging/add', exact: true },
        component: LoggingAddPage,
      },
      {
        name: 'Edit Logging',
        link: { path: '/logging/edit/:id', exact: true },
        component: LoggingEditPage,
      },
      {
        name: 'Add Namespace',
        link: { path: '/namespaces/add', exact: true },
        component: AddNamespacePage,
      },
      {
        name: 'API Access',
        link: { path: '/api_access', exact: true },
        component: ApiAccessPage,
      },
      {
        name: 'Tenants & Users',
        link: { path: '/user_management', exact: true },
        component: UserManagementIndexPage,
      },
      {
        name: 'Add Tenant',
        link: { path: '/user_management/tenants/add', exact: true },
        component: AddTenantPage,
      },
      {
        name: 'Create Prometheus Instance',
        link: { path: '/prometheus/instances/add', exact: true },
        component: AddPrometheusInstancePage,
      },
      {
        name: 'Edit Prometheus Instance',
        link: { path: '/prometheus/instances/edit/:id', exact: true },
        component: UpdatePrometheusInstancePage,
      },
      {
        name: 'Edit Prometheus Rule',
        link: { path: '/prometheus/rules/edit/:id', exact: true },
        component: UpdatePrometheusRulePage,
      },
      {
        name: 'Edit Prometheus Service Monitor',
        link: { path: '/prometheus/serviceMonitors/edit/:id', exact: true },
        component: UpdatePrometheusServiceMonitorPage,
      },
      {
        name: 'Edit Prometheus Alert Manager',
        link: { path: '/prometheus/alertManagers/edit/:id', exact: true },
        component: UpdatePrometheusAlertManagerPage,
      },
      {
        name: 'Guided Onboarding',
        link: { path: '/onboarding', exact: true },
        component: OnboardingPage,
      },
    ],
  )

  const hostPrefix = '' // set to another host during development
  const clarityBase = path => `${hostPrefix}/clarity/index.html#${path}`
  const clarityLink = path => ({ link: { path: clarityBase(path), external: true } })

  // const useClarityLinks = !(window.localStorage.disableClarityLinks === 'true' || config.developer)

  // New builds should default to just the new UI
  const useClarityLinks = false

  // These nav items will redirect to the old "clarity" UI while the new UI is under development.
  const clarityNavItems = [
    {
      name: 'Dashboard',
      ...clarityLink('/dashboard'),
      icon: 'tachometer',
    },
    {
      name: 'Infrastructure',
      ...clarityLink('/infrastructureK8s'),
      icon: 'building',
      nestedLinks: [
        { name: 'Clusters', ...clarityLink('/infrastructureK8s#clusters') },
        { name: 'Nodes', ...clarityLink('/infrastructureK8s#nodes') },
        { name: 'Cloud Providers', ...clarityLink('/infrastructureK8s#cps') },
      ],
    },
    {
      name: 'App Catalog',
      ...clarityLink('/kubernetes/apps'),
      icon: 'th',
      nestedLinks: [
        { name: 'App Catalog', ...clarityLink('/kubernetes/apps#catalog') },
        { name: 'Deployed Apps', ...clarityLink('/kubernetes/apps#deployed_apps') },
        { name: 'Repositories', ...clarityLink('/kubernetes/apps#repositories') },
      ],
    },
    {
      name: 'Pods, Deployments, Services',
      ...clarityLink('/podsK8s'),
      icon: 'cubes',
      nestedLinks: [
        { name: 'Pods', ...clarityLink('/podsK8s#pods') },
        { name: 'Deployments', ...clarityLink('/podsK8s#deployments') },
        { name: 'Services', ...clarityLink('/podsK8s#services') },
      ],
    },
    { name: 'Storage Classes', icon: 'hdd', ...clarityLink('/kubernetes/storage_classes') },
    { name: 'Namespaces', icon: 'object-group', ...clarityLink('/kubernetes/namespaces') },
    { name: 'Prometheus Monitoring (BETA)', icon: 'chart-area', link: { path: '/prometheus' } },
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
      ],
    },
  ]

  // These nav items are in active development but not shown in production.
  const devNavItems = [
    {
      name: 'Dashboard',
      link: { path: '/dashboard' },
      icon: 'tachometer',
    },
    {
      name: 'Infrastructure',
      link: { path: '/infrastructure' },
      icon: 'building',
      nestedLinks: [
        { name: 'Clusters', link: { path: '/infrastructure#clusters' } },
        { name: 'Nodes', link: { path: '/infrastructure#nodes' } },
        { name: 'Cloud Providers', link: { path: '/infrastructure#cloudProviders' } },
      ],
    },
    {
      name: 'App Catalog',
      link: { path: '/apps' },
      icon: 'th',
      nestedLinks: [
        { name: 'App Catalog', link: { path: '/apps#appCatalog' } },
        { name: 'Deployed Apps', link: { path: '/apps#deployedApps' } },
        { name: 'Repositories', link: { path: '/apps#repositories' } },
      ],
    },
    {
      name: 'Pods, Deployments, Services',
      link: { path: '/pods' },
      icon: 'cubes',
      nestedLinks: [
        { name: 'Pods', link: { path: '/pods#pods' } },
        { name: 'Deployments', link: { path: '/pods#deployments' } },
        { name: 'Services', link: { path: '/pods#services' } },
      ],
    },
    { name: 'Storage Classes', icon: 'hdd', link: { path: '/storage_classes' } },
    { name: 'Namespaces', icon: 'object-group', link: { path: '/namespaces' } },
    { name: 'Prometheus Monitoring (BETA)', icon: 'chart-area', link: { path: '/prometheus' } },
    { name: 'Logging (beta)', icon: 'clipboard-list', link: { path: '/logging' } },
    { name: 'API Access', icon: 'key', link: { path: '/api_access' } },
    {
      name: 'Tenants & Users',
      link: { path: '/user_management' },
      icon: 'user',
      nestedLinks: [
        { name: 'Tenants', link: { path: '/user_management#tenants' } },
        { name: 'Users', link: { path: '/user_management#users' } },
        { name: 'Groups', link: { path: '/user_management#userGroups' } },
        { name: 'Roles', link: { path: '/user_management#roles' } },
      ],
    },
  ]

  const navItems = useClarityLinks ? clarityNavItems : devNavItems
  const commonNavItems = []
  const allNavItems = [...navItems, ...commonNavItems]
  plugin.registerNavItems(allNavItems)
}

export default Kubernetes
