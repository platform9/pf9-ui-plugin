// libs
import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/styles'
import { AppContext } from 'core/providers/AppProvider'
// Constants
import { allKey } from 'app/constants'
// Actions
import { podActions, deploymentActions, serviceActions } from '../pods/actions'
import { clusterActions } from '../infrastructure/clusters/actions'
import { loadNodes } from '../infrastructure/nodes/actions'
import { mngmUserActions } from '../userManagement/users/actions'
import { mngmTenantActions } from '../userManagement/tenants/actions'
import { cloudProviderActions } from '../infrastructure/cloudProviders/actions'
// Components
import StatusCard from './StatusCard'

const useStyles = makeStyles(theme => ({
  cardRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  cardColumn: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
}))

const topReports = [
  {
    entity: 'user',
    permissions: ['admin'],
    route: '/ui/kubernetes/user_management#users',
    addRoute: '/ui/kubernetes/user_management/users/add',
    title: 'Users',
    icon: 'user',
    dataLoader: [mngmUserActions.list],
    quantityFn: users => ({
      quantity: users.length,
    }),
  },
  {
    entity: 'tenant',
    permissions: ['admin'],
    route: '/ui/kubernetes/user_management#tenants',
    addRoute: '/ui/kubernetes/user_management/tenants/add',
    title: 'Tenants',
    icon: 'users-class',
    dataLoader: [mngmTenantActions.list],
    quantityFn: tenants => ({
      quantity: tenants.length,
    }),
  },
  {
    entity: 'deployment',
    route: '/ui/kubernetes/pods#deployments',
    addRoute: '/ui/kubernetes/pods/deployments/add',
    title: 'Deployments',
    icon: 'window',
    dataLoader: [deploymentActions.list, { clusterId: allKey }],
    quantityFn: deployments => ({
      quantity: deployments.length,
    }),
  },
  {
    entity: 'service',
    route: '/ui/kubernetes/pods#services',
    addRoute: '/ui/kubernetes/pods/services/add',
    title: 'Services',
    icon: 'tasks-alt',
    dataLoader: [serviceActions.list, { clusterId: allKey }],
    quantityFn: services => ({
      quantity: services.length,
    }),
  },
]
const bottomReports = [
  {
    entity: 'cloud',
    permissions: ['admin'],
    route: '/ui/kubernetes/infrastructure#cloudProviders',
    addRoute: '/ui/kubernetes/infrastructure/cloudProviders/add',
    title: 'Cloud Accounts',
    icon: 'cloud',
    dataLoader: [cloudProviderActions.list],
    quantityFn: clouds => ({
      quantity: clouds.length
    }),
  },
  {
    entity: 'pod',
    route: '/ui/kubernetes/pods',
    addRoute: '/ui/kubernetes/pods/add',
    title: 'Pods',
    icon: 'cubes',
    dataLoader: [podActions.list, { clusterId: allKey }],
    quantityFn: pods => ({
      quantity: pods.length,
      pieData: [
        {
          name: 'running',
          value: pods.filter(pod => pod.status.phase === 'Running').length,
          color: 'success',
        },
        {
          name: 'pending',
          value: pods.filter(pod => pod.status.phase === 'Pending').length,
          color: 'warning',
        },
        {
          name: 'unknown',
          value: pods.filter(pod => pod.status.phase === 'Unknown').length,
          color: 'unknown',
        },
        {
          name: 'failed',
          value: pods.filter(pod => pod.status.phase === 'Failed').length,
          color: 'error',
        },
      ],
      piePrimary: 'running',
    }),
  },
  {
    entity: 'cluster',
    permissions: ['admin'], // Technically non-admins have read-only access
    route: '/ui/kubernetes/infrastructure#clusters',
    addRoute: '/ui/kubernetes/infrastructure/clusters/add',
    title: 'Clusters',
    icon: 'project-diagram',
    dataLoader: [clusterActions.list],
    quantityFn: clusters => ({
      quantity: clusters.length,
      pieData: [
        {
          name: 'healthy',
          value: clusters.filter(cluster => cluster.healthStatus === 'healthy').length,
          color: 'success',
        },
        {
          name: 'partially_healthy',
          value: clusters.filter(cluster => cluster.healthStatus === 'partially_healthy').length,
          color: 'warning',
        },
        {
          name: 'converging',
          value: clusters.filter(cluster => cluster.healthStatus === 'converging').length,
          color: 'unknown',
        },
        {
          name: 'unhealthy',
          value: clusters.filter(cluster => cluster.healthStatus === 'unhealthy').length,
          color: 'error',
        },
      ],
      piePrimary: 'healthy',
    })
  },
  {
    entity: 'node',
    permissions: ['admin'],
    route: '/ui/kubernetes/infrastructure#nodes',
    addRoute: '/ui/kubernetes/infrastructure/nodes/cli/download',
    title: 'Nodes',
    icon: 'ball-pile',
    dataLoader: [loadNodes],
    quantityFn: nodes => ({
      quantity: nodes.length,
      pieData: [
        {
          name: 'healthy',
          value: nodes.filter(node => nodeHealthStatus(node) === 'healthy').length,
          color: 'success',
        },
        {
          name: 'unknown',
          value: nodes.filter(node => nodeHealthStatus(node) === 'unknown').length,
          color: 'unknown',
        },
        {
          name: 'converging',
          value: nodes.filter(node => nodeHealthStatus(node) === 'converging').length,
          color: 'warning',
        },
        {
          name: 'unhealthy',
          value: nodes.filter(node => nodeHealthStatus(node) === 'unhealthy').length,
          color: 'error',
        },
      ],
      piePrimary: 'healthy',
    }),
  },
]

const reportsWithPerms = (reports) => {
  const { userDetails: { role } } = useContext(AppContext)
  return reports.filter((report) => {
    // No permissions property means no restrictions
    if (!report.permissions) { return true }
    return report.permissions.includes(role)
  })
}

const nodeHealthStatus = ({ status }) => {
  if (status === 'converging') { return status }
  return status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
}

const DashboardPage = () => {
  const { cardColumn, cardRow } = useStyles()

  return (
    <section name="dashboard-status-container" className={cardColumn}>
      <div className={cardRow}>
        {reportsWithPerms(topReports).map(report => (
          <StatusCard key={report.route} {...report} />
        ))}
      </div>
      <div className={cardRow}>
        {reportsWithPerms(bottomReports).map(report => (
          <StatusCard key={report.route} {...report} />
        ))}
      </div>
    </section>
  )
}

export default DashboardPage
