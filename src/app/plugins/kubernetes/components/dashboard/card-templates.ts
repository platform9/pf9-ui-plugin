// Constants
import { allKey } from 'app/constants'
// Actions
import { deploymentActions, podActions, serviceActions } from '../pods/actions'
import { clusterActions } from '../infrastructure/clusters/actions'
import { loadNodes } from '../infrastructure/nodes/actions'
import { mngmUserActions } from 'account/components/userManagement/users/actions'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import { cloudProviderActions } from '../infrastructure/cloudProviders/actions'

import { routes } from 'core/utils/routes'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import {
  isHealthyStatus,
  isTransientStatus,
  isUnhealthyStatus,
} from '../infrastructure/clusters/ClusterStatusUtils'
import { importedClusterActions } from '../infrastructure/importedClusters/actions'
import { ImportedClusterSelector } from '../infrastructure/importedClusters/model'

import { StatusCardProps } from './StatusCard'

const nodeHealthStatus = ({ status }) => {
  if (status === 'converging') {
    return status
  }
  return status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
}

export interface IStatusCardWithFilterProps extends StatusCardProps {
  permissions: string[]
}

export enum DashBoardStatusCardTypes {
  Cluster = 'cluster',
  ImportedCluster = 'importedCluster',
  Node = 'node',
  Cloud = 'cloud',
  User = 'user',
  Tenant = 'tenant',
  Deployment = 'deployment',
  Service = 'service',
  Pod = 'pod',
}

export const clusterStatusCardProps: IStatusCardWithFilterProps = {
  entity: 'cluster',
  permissions: ['admin'], // Technically non-admins have read-only access
  route: routes.cluster.list.path(),
  addRoute: routes.cluster.add.path(),
  title: 'Clusters Total',
  icon: 'project-diagram',
  dataLoader: [clusterActions.list, {}],
  quantityFn: (clusters) => ({
    quantity: clusters.length,
    pieData: [
      {
        name: 'healthy',
        value: clusters.filter((cluster) => isHealthyStatus(cluster.healthStatus)).length,
        color: 'green.main',
        info: 'Platform9 components & K8s API are responding',
      },
      {
        name: 'partially_healthy',
        value: clusters.filter((cluster) => cluster.healthStatus === 'partially_healthy').length,
        color: 'yellow.main',
        info: 'Platform9 components or K8s API are not responding',
      },
      {
        name: 'converging',
        value: clusters.filter((cluster) => isTransientStatus(cluster.healthStatus)).length,
        color: 'orange.main',
        info: 'Platform9 components are upgrading or installing',
      },
      {
        name: 'unhealthy',
        value: clusters.filter((cluster) => isUnhealthyStatus(cluster.healthStatus)).length,
        color: 'red.main',
        info: 'Platform9 components are offline and not responding',
      },
    ],
    piePrimary: 'healthy',
  }),
}

export const importedClusterStatusCardProps: IStatusCardWithFilterProps = {
  entity: 'importedCluster',
  permissions: ['admin'],
  route: 'n/a',
  addRoute: 'n/a',
  title: 'Clusters Total',
  icon: 'n/a',
  dataLoader: [importedClusterActions.list, {}],
  quantityFn: (clusters: ImportedClusterSelector[]) => ({
    quantity: clusters.length,
    // Possible "" value, not sure what to do with that
    pieData: [
      {
        name: 'running',
        value: clusters.filter((cluster) => cluster.status.phase === 'Running').length,
        color: 'green.main',
      },
      {
        name: 'pending',
        value: clusters.filter((cluster) => cluster.status.phase === 'Pending').length,
        color: 'yellow.main',
      },
      {
        name: 'terminating',
        value: clusters.filter((cluster) => cluster.status.phase === 'Terminating').length,
        color: 'orange.main',
      },
      {
        name: 'failing',
        value: clusters.filter((cluster) => cluster.status.phase === 'Failing').length,
        color: 'red.main',
      },
    ],
    piePrimary: 'running',
  }),
}

export const nodeStatusCardProps: IStatusCardWithFilterProps = {
  entity: 'node',
  permissions: ['admin'],
  route: routes.nodes.list.path(),
  addRoute: routes.nodes.add.path(),
  title: 'Nodes',
  icon: 'ball-pile',
  dataLoader: [loadNodes, {}],
  quantityFn: (nodes) => ({
    quantity: nodes.length,
    pieData: [
      {
        name: 'healthy',
        value: nodes.filter((node) => nodeHealthStatus(node) === 'healthy').length,
        color: 'green.main',
      },
      {
        name: 'unknown',
        value: nodes.filter((node) => nodeHealthStatus(node) === 'unknown').length,
        color: 'yellow.main',
      },
      {
        name: 'converging',
        value: nodes.filter((node) => nodeHealthStatus(node) === 'converging').length,
        color: 'orange.main',
      },
      {
        name: 'unhealthy',
        value: nodes.filter((node) => nodeHealthStatus(node) === 'unhealthy').length,
        color: 'red.main',
      },
    ],
    piePrimary: 'healthy',
  }),
}
export const cloudStatusCardProps: IStatusCardWithFilterProps = {
  entity: 'cloud',
  permissions: ['admin'],
  route: routes.cloudProviders.list.path(),
  addRoute: routes.cloudProviders.add.path({ type: CloudProviders.Aws }),
  title: 'Cloud Accounts',
  icon: 'cloud',
  dataLoader: [cloudProviderActions.list, {}],
  quantityFn: (clouds) => ({
    quantity: clouds.length,
    pieData: [
      {
        name: 'AWS',
        value: clouds.filter((cloud) => cloud.type === CloudProviders.Aws).length,
        color: 'aws.main',
      },
      {
        name: 'Azure',
        value: clouds.filter((cloud) => cloud.type === CloudProviders.Azure).length,
        color: 'azure.main',
      },
      {
        name: 'Google',
        value: clouds.filter((cloud) => cloud.type === CloudProviders.Gcp).length,
        color: 'googleYellow.main',
      },
    ],
    graphType: 'donut',
  }),
}

export const userStatusCardProps = {
  entity: 'user',
  permissions: ['admin'],
  overallPermissions: ['admin'],
  route: routes.userManagement.users.path(),
  addRoute: routes.userManagement.addUser.path(),
  title: 'Users',
  icon: 'user',
  dataLoader: [mngmUserActions.list],
  quantityFn: (users) => ({
    quantity: users.length,
  }),
}
export const tenantStatusCardProps = {
  entity: 'tenant',
  permissions: ['admin'],
  overallPermissions: ['admin'],
  route: routes.userManagement.tenants.path(),
  addRoute: routes.userManagement.addTenant.path(),
  title: 'Tenants',
  icon: 'users-class',
  dataLoader: [mngmTenantActions.list],
  quantityFn: (tenants) => ({
    quantity: tenants.length,
  }),
}
export const deploymentStatusCardProps = {
  entity: 'deployment',
  route: routes.deployments.list.path(),
  addRoute: routes.deployments.add.path(),
  title: 'Deployments',
  icon: 'window',
  dataLoader: [deploymentActions.list, { clusterId: allKey }],
  quantityFn: (deployments) => ({
    quantity: deployments.length,
  }),
}
export const serviceStatusCardProps = {
  entity: 'service',
  route: routes.services.list.path(),
  addRoute: routes.services.add.path(),
  title: 'Services',
  icon: 'tasks-alt',
  dataLoader: [serviceActions.list, { clusterId: allKey }],
  quantityFn: (services) => ({
    quantity: services.length,
  }),
}
export const podStatusCardProps = {
  entity: 'pod',
  route: routes.pods.list.path(),
  addRoute: routes.pods.add.path(),
  title: 'Pods',
  icon: 'cubes',
  dataLoader: [podActions.list, { clusterId: allKey }],
  quantityFn: (pods) => ({
    quantity: pods.length,
    pieData: [
      {
        name: 'running',
        value: pods.filter((pod) => pod?.status?.phase === 'Running').length,
        color: 'green.main',
      },
      {
        name: 'pending',
        value: pods.filter((pod) => pod?.status?.phase === 'Pending').length,
        color: 'orange.main',
      },
      {
        name: 'unknown',
        value: pods.filter((pod) => pod?.status?.phase === 'Unknown').length,
        color: 'yellow.main',
      },
      {
        name: 'failed',
        value: pods.filter((pod) => pod?.status?.phase === 'Failed').length,
        color: 'red.main',
      },
    ],
    piePrimary: 'running',
  }),
}

export const dashboardCardsByType = {
  [DashBoardStatusCardTypes.Cluster]: clusterStatusCardProps,
  [DashBoardStatusCardTypes.ImportedCluster]: importedClusterStatusCardProps,
  [DashBoardStatusCardTypes.Node]: nodeStatusCardProps,
  [DashBoardStatusCardTypes.Cloud]: cloudStatusCardProps,
  [DashBoardStatusCardTypes.User]: userStatusCardProps,
  [DashBoardStatusCardTypes.Tenant]: tenantStatusCardProps,
  [DashBoardStatusCardTypes.Deployment]: deploymentStatusCardProps,
  [DashBoardStatusCardTypes.Service]: serviceStatusCardProps,
  [DashBoardStatusCardTypes.Pod]: podStatusCardProps,
}
