import React from 'react'
import NotificationsPage from 'core/components/notifications/NotificationsPage'
import AddCloudProviderPage from './components/infrastructure/cloudProviders/AddCloudProviderPage'
import AddAwsClusterPage from './components/infrastructure/clusters/aws/AddAwsClusterPage'
import AddAzureClusterPage from './components/infrastructure/clusters/azure/AddAzureClusterPage'
import AddClusterPage from './components/infrastructure/clusters/AddClusterPage'
import AddBareOsClusterPage from './components/infrastructure/clusters/bareos/AddBareOsClusterPage'
import ScaleMastersPage from './components/infrastructure/clusters/ScaleMastersPage'
import ScaleWorkersPage from './components/infrastructure/clusters/ScaleWorkersPage'
import AddNamespacePage from './components/namespaces/AddNamespacePage'
import ApiAccessPage from './components/apiAccess/ApiAccessPage'
import AppsIndexPage from './components/app-catalog/apps-index-page'
import ClusterDetailsPage from './components/infrastructure/clusters/ClusterDetailsPage'
import NodeDetailsPage from './components/infrastructure/nodes/NodeDetailsPage'
import InfrastructurePage from './components/infrastructure/InfrastructurePage'
import OnboardingPage from './components/onboarding/onboarding-page'
import PodsIndexPage from './components/pods/PodsIndexPage'
import StorageClassesPage from './components/storage/StorageClassesPage'
import UpdateCloudProviderPage from './components/infrastructure/cloudProviders/UpdateCloudProviderPage'
import StorageClassesAddPage from './components/storage/AddStorageClassPage'
import AddPrometheusInstancePage from './components/prometheus/AddPrometheusInstancePage'
import PrometheusMonitoringPage from './components/prometheus/PrometheusMonitoringPage'
import UpdatePrometheusInstancePage from './components/prometheus/UpdatePrometheusInstancePage'
import UpdatePrometheusRulePage from './components/prometheus/UpdatePrometheusRulePage'
import UpdatePrometheusServiceMonitorPage from './components/prometheus/UpdateServiceMonitorPage'
import UpdatePrometheusAlertManagerPage from './components/prometheus/UpdatePrometheusAlertManagerPage'
import LoggingIndexPage from './components/logging/LoggingIndexPage'
import LoggingAddPage from './components/logging/LoggingAddPage'
import LoggingEditPage from './components/logging/LoggingEditPage'
import DashboardPage from './components/dashboard/DashboardPage'
import AddResourcePage from 'k8s/components/pods/AddResourcePage'
import RbacIndexPage from './components/rbac/RbacIndexPage'
import AddRolePage from './components/rbac/AddRolePage'
import AddClusterRolePage from './components/rbac/AddClusterRolePage'
import AddRoleBindingPage from './components/rbac/AddRoleBindingPage'
import AddClusterRoleBindingPage from './components/rbac/AddClusterRoleBindingPage'
import EditClusterPage from 'k8s/components/infrastructure/clusters/EditClusterPage'
import UpdateRolePage from './components/rbac/UpdateRolePage'
import UpdateClusterRolePage from './components/rbac/UpdateClusterRolePage'
import UpdateRoleBindingPage from './components/rbac/UpdateRoleBindingPage'
import UpdateClusterRoleBindingPage from './components/rbac/UpdateClusterRoleBindingPage'
// import OnboardingBanner from './components/onboarding/OnboardingBanner'
// import AlarmsListPage from './components/alarms/AlarmsListPage'
import MonitoringPage from './components/monitoring/MonitoringPage'
import ApiServicesPage from './components/apiAccess/ApiServicesPage'
import OnboardNewNodePage from './components/infrastructure/nodes/onboard-new-node-page'
import AddRepositoryPage from './components/app-catalog/repositories/add-repository-page'
import DeployAppPage from './components/app-catalog/deployed-apps/deploy-app-page'
import EditRepositoryPage from './components/app-catalog/repositories/edit-repository-page'
import EditAppDeploymentPage from './components/app-catalog/deployed-apps/edit-app-deployment-page'
import ImportClusterPage from './components/infrastructure/clusters/import/ImportClusterPage'
import ImportEKSClusterPage from './components/infrastructure/clusters/import/ImportEKSClusterPage'
import ImportedClusterDetailsPage from './components/infrastructure/importedClusters/imported-cluster-details'
import VirtualMachinesPage from './components/virtual-machines'
import VirtualMachineDetailPage from './components/virtual-machines/details'
import AddVirtualMachinePage from './components/virtual-machines/add'
import ImportAKSClusterPage from './components/infrastructure/clusters/import/ImportAKSClusterPage'
import ImportGKEClusterPage from './components/infrastructure/clusters/import/ImportGKEClusterPage'
import CreateRbacProfile from 'k8s/components/rbac/profiles/create'
import RbacProfilesIndexPage from './components/rbac/profiles/rbac-profiles-index-page'
import { isDecco } from 'core/utils/helpers'

class Kubernetes extends React.PureComponent {
  render() {
    return <h1>Kubernetes Plugin</h1>
  }
}

Kubernetes.__name__ = 'kubernetes'

Kubernetes.registerPlugin = (pluginManager) => {
  const plugin = pluginManager.registerPlugin('kubernetes', 'Kubernetes', '/ui/kubernetes')
  // plugin.registerComponent(OnboardingBanner)

  plugin.registerRoutes([
    {
      name: 'Dashboard',
      link: { path: '/dashboard', exact: true, default: true },
      component: DashboardPage,
    },
    {
      name: 'Notifications',
      link: { path: '/notifications', exact: true },
      component: NotificationsPage,
    },
    {
      name: 'Infrastructure',
      link: { path: '/infrastructure', exact: true },
      component: InfrastructurePage,
    },
    {
      name: 'Create Cluster',
      link: { path: '/infrastructure/clusters/add', exact: true },
      requiredRoles: 'admin',
      component: AddClusterPage,
    },
    {
      name: 'Create AWS Cluster',
      link: { path: '/infrastructure/clusters/aws/add/:type', exact: true },
      requiredRoles: 'admin',
      component: AddAwsClusterPage,
    },
    {
      name: 'Create Azure Cluster',
      link: { path: '/infrastructure/clusters/azure/add/:type', exact: true },
      requiredRoles: 'admin',
      component: AddAzureClusterPage,
    },
    {
      name: 'Create Bare OS Cluster',
      link: { path: '/infrastructure/clusters/bareos/add/:platform/:type', exact: true },
      requiredRoles: 'admin',
      component: AddBareOsClusterPage,
    },
    {
      name: 'Import Cluster',
      link: { path: '/infrastructure/clusters/import', exact: true },
      requiredRoles: 'admin',
      component: ImportClusterPage,
    },
    {
      name: 'Import EKS Cluster',
      link: { path: '/infrastructure/clusters/import/eks', exact: true },
      requiredRoles: 'admin',
      component: ImportEKSClusterPage,
    },
    {
      name: 'Import AKS Cluster',
      link: { path: '/infrastructure/clusters/import/aks', exact: true },
      requiredRoles: 'admin',
      component: ImportAKSClusterPage,
    },
    {
      name: 'Import GKE Cluster',
      link: { path: '/infrastructure/clusters/import/gke', exact: true },
      requiredRoles: 'admin',
      component: ImportGKEClusterPage,
    },
    {
      name: 'Imported Cluster Details',
      link: { path: '/infrastructure/clusters/imported/:id', exact: true },
      requiredRoles: 'admin',
      component: ImportedClusterDetailsPage,
    },
    {
      name: 'Edit Cluster',
      link: { path: '/infrastructure/clusters/edit/:id', exact: true },
      component: EditClusterPage,
    },
    {
      name: 'Scale Masters',
      link: { path: '/infrastructure/clusters/scaleMasters/:id', exact: true },
      requiredRoles: 'admin',
      component: ScaleMastersPage,
    },
    {
      name: 'Scale Workers',
      link: { path: '/infrastructure/clusters/scaleWorkers/:id', exact: true },
      requiredRoles: 'admin',
      component: ScaleWorkersPage,
    },
    {
      name: 'Cluster Details',
      link: { path: '/infrastructure/clusters/:id', exact: true },
      component: ClusterDetailsPage,
    },
    {
      name: 'Onboard a Node',
      link: { path: '/infrastructure/nodes/add', exact: true },
      component: OnboardNewNodePage,
    },
    {
      name: 'Node Details',
      link: { path: '/infrastructure/nodes/:id', exact: true },
      component: NodeDetailsPage,
    },
    {
      name: 'Create Cloud Provider',
      link: { path: '/infrastructure/cloudProviders/add', exact: true },
      requiredRoles: 'admin',
      component: AddCloudProviderPage,
    },
    {
      name: 'Update Cloud Provider',
      link: { path: '/infrastructure/cloudProviders/edit/:id', exact: true },
      requiredRoles: 'admin',
      component: UpdateCloudProviderPage,
    },
    {
      name: 'Virtual Machines',
      flag: 'Early Access',
      link: { path: '/virtual-machines', exact: true },
      requiredRoles: 'admin',
      component: VirtualMachinesPage,
    },
    {
      name: 'Add Virtual Machine',
      link: { path: '/virtual-machines/add/new', exact: true },
      requiredRoles: 'admin',
      component: AddVirtualMachinePage,
    },
    {
      name: 'Add Virtual Machine',
      link: { path: '/virtual-machines/import/url', exact: true },
      requiredRoles: 'admin',
      component: AddVirtualMachinePage,
    },
    {
      name: 'Add Virtual Machine',
      link: { path: '/virtual-machines/import/disk', exact: true },
      requiredRoles: 'admin',
      component: AddVirtualMachinePage,
    },
    {
      name: 'Add Virtual Machine',
      link: { path: '/virtual-machines/clone/pvc', exact: true },
      requiredRoles: 'admin',
      component: AddVirtualMachinePage,
    },
    {
      name: 'Virtual Machine Details',
      link: { path: '/virtual-machines/:clusterId/:namespace/:name', exact: true },
      requiredRoles: 'admin',
      component: VirtualMachineDetailPage,
    },
    {
      name: 'App Catalog',
      link: { path: '/apps', exact: true },
      requiredFeatures: isDecco,
      component: AppsIndexPage,
    },
    {
      name: 'Deploy App',
      link: { path: '/apps/deploy/:repository/:name' },
      component: DeployAppPage,
    },
    {
      name: 'Edit Deployed App',
      link: { path: '/apps/deployed/edit/:clusterId/:namespace/:name', exact: true },
      component: EditAppDeploymentPage,
    },
    {
      name: 'Add Repository',
      link: { path: '/apps/repositories/add', exact: true },
      component: AddRepositoryPage,
    },
    {
      name: 'Edit Repository',
      link: { path: '/apps/repositories/edit/:id' },
      component: EditRepositoryPage,
    },
    {
      name: 'Workloads',
      link: { path: '/workloads', exact: true },
      component: PodsIndexPage,
    },
    {
      name: 'Add Pod',
      link: { path: '/workloads/pods/add', exact: true },
      component: () => <AddResourcePage resourceType="pod" />,
    },
    {
      name: 'Add Deployment',
      link: { path: '/workloads/deployments/add', exact: true },
      component: () => <AddResourcePage resourceType="deployment" />,
    },
    {
      name: 'Add Service',
      link: { path: '/workloads/services/add', exact: true },
      component: () => <AddResourcePage resourceType="service" />,
    },
    {
      name: 'Add Namespace',
      link: { path: '/workloads/namespaces/add', exact: true },
      component: AddNamespacePage,
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
      name: 'Monitoring (beta)',
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
      name: 'API Access',
      link: { path: '/api-access', exact: true },
      component: ApiAccessPage,
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
    {
      name: 'RBAC',
      requiredRoles: 'admin',
      link: { path: '/rbac', exact: true },
      component: RbacIndexPage,
    },
    {
      name: 'Add RBAC Profile',
      requiredRoles: 'admin',
      link: { path: '/rbac_profiles/add', exact: true },
      component: CreateRbacProfile,
    },
    {
      name: 'Add Role',
      requiredRoles: 'admin',
      link: { path: '/rbac/roles/add', exact: true },
      component: AddRolePage,
    },
    {
      name: 'Add Cluster Role',
      requiredRoles: 'admin',
      link: { path: '/rbac/clusterroles/add', exact: true },
      component: AddClusterRolePage,
    },
    {
      name: 'Add Role Binding',
      requiredRoles: 'admin',
      link: { path: '/rbac/rolebindings/add', exact: true },
      component: AddRoleBindingPage,
    },
    {
      name: 'Add Cluster Role Binding',
      link: { path: '/rbac/clusterrolebindings/add', exact: true },
      component: AddClusterRoleBindingPage,
    },
    {
      name: 'Update Role',
      link: { path: '/rbac/roles/edit/:id/cluster/:clusterId', exact: true },
      component: UpdateRolePage,
    },
    {
      name: 'Update Cluster Role',
      link: { path: '/rbac/clusterroles/edit/:id/cluster/:clusterId', exact: true },
      component: UpdateClusterRolePage,
    },
    {
      name: 'Update Role Binding',
      link: { path: '/rbac/rolebindings/edit/:id/cluster/:clusterId', exact: true },
      component: UpdateRoleBindingPage,
    },
    {
      name: 'Update Cluster Role Binding',
      link: { path: '/rbac/clusterrolebindings/edit/:id/cluster/:clusterId', exact: true },
      component: UpdateClusterRoleBindingPage,
    },
    {
      name: 'Alarms',
      link: { path: '/alarms', exact: true },
      component: MonitoringPage,
    },
    {
      name: 'RBAC Profiles',
      requiredRoles: 'admin',
      link: { path: '/rbac_profiles', exact: true },
      component: RbacProfilesIndexPage,
    },
  ])

  const hostPrefix = '' // set to another host during development
  const clarityBase = (path) => `${hostPrefix}/clarity/index.html#${path}`
  const clarityLink = (path) => ({ link: { path: clarityBase(path), external: true } })

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
        {
          name: 'Clusters',
          ...clarityLink('/infrastructureK8s#clusters'),
        },
        {
          name: 'Nodes',
          requiredRoles: 'admin',
          ...clarityLink('/infrastructureK8s#nodes'),
        },
        {
          name: 'Cloud Providers',
          requiredRoles: 'admin',
          ...clarityLink('/infrastructureK8s#cps'),
        },
      ],
    },
    {
      name: 'Workloads',
      ...clarityLink('/podsK8s'),
      icon: 'cubes',
      nestedLinks: [
        { name: 'Pods', ...clarityLink('/podsK8s#pods') },
        { name: 'Deployments', ...clarityLink('/podsK8s#deployments') },
        { name: 'Services', ...clarityLink('/podsK8s#services') },
        { name: 'Namespaces', ...clarityLink('/kubernetes/namespaces') },
      ],
    },
    { name: 'Storage Classes', icon: 'hdd', ...clarityLink('/kubernetes/storage_classes') },
    {
      name: 'Virtual Machines',
      flag: 'Early Access',
      icon: 'window',
      ...clarityLink('/kubernetes/virtual-machines'),
    },
    {
      name: 'Apps',
      ...clarityLink('/kubernetes/apps'),
      icon: 'th',
      requiredFeatures: isDecco,
      nestedLinks: [
        { name: 'App Catalog', ...clarityLink('/kubernetes/apps#catalog') },
        { name: 'Deployed Apps', ...clarityLink('/kubernetes/apps#deployed_apps') },
        {
          name: 'Repositories',
          requiredRoles: 'admin',
          ...clarityLink('/kubernetes/apps#repositories'),
        },
      ],
    },
    { name: 'Prometheus Monitoring (BETA)', icon: 'chart-area', link: { path: '/prometheus' } },
    { name: 'Monitoring', icon: 'analytics', link: { path: '/alarms' } },
    { name: 'API Access', icon: 'key', ...clarityLink('/kubernetes/api-access') },
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
        { name: 'Nodes', requiredRoles: 'admin', link: { path: '/infrastructure#nodes' } },
        {
          name: 'Cloud Providers',
          requiredRoles: 'admin',
          link: { path: '/infrastructure#cloudProviders' },
        },
      ],
    },
    {
      name: 'Workloads',
      link: { path: '/workloads' },
      icon: 'cubes',
      nestedLinks: [
        { name: 'Pods', link: { path: '/workloads#pods' } },
        { name: 'Deployments', link: { path: '/workloads#deployments' } },
        { name: 'Services', link: { path: '/worloads#services' } },
        { name: 'Namespaces', link: { path: '/workloads#namespaces' } },
      ],
    },
    { name: 'Storage Classes', icon: 'hdd', link: { path: '/storage_classes' } },
    {
      name: 'Virtual Machines',
      flag: 'Early Access',
      icon: 'window',
      link: { path: '/virtual-machines' },
    },
    {
      name: 'Apps',
      link: { path: '/apps' },
      icon: 'th',
      requiredFeatures: isDecco,
      nestedLinks: [
        { name: 'App Catalog', link: { path: '/apps#appCatalog' } },
        { name: 'Deployed Apps', link: { path: '/apps#deployedApps' } },
        {
          name: 'Repositories',
          link: { path: '/apps#repositories', requiredRoles: ['admin'] },
        },
      ],
    },
    {
      name: 'Cluster Profiles',
      icon: 'user-shield',
      requiredRoles: 'admin',
      link: { path: '/rbac_profiles' },
    },
    // TODO: Disabled till all CRUD operations are implemented
    // { name: 'Monitoring (beta)', icon: 'chart-area', link: { path: '/prometheus' } },
    // { name: 'Logging (beta)', icon: 'clipboard-list', link: { path: '/logging' } },
    { name: 'Monitoring', icon: 'analytics', link: { path: '/alarms' } },
    {
      name: 'RBAC',
      icon: 'user-shield',
      requiredRoles: 'admin',
      link: { path: '/rbac' },
    },
    { name: 'API Access', icon: 'key', link: { path: '/api-access' } },
  ]

  const navItems = useClarityLinks ? clarityNavItems : devNavItems
  const commonNavItems = []
  const allNavItems = [...navItems, ...commonNavItems]
  plugin.registerNavItems(allNavItems)
}

export default Kubernetes
