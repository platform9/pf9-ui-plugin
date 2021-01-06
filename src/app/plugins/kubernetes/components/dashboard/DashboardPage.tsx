// libs
import React from 'react'
import { prop } from 'ramda'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/styles'
// Constants
import { allKey } from 'app/constants'
// Actions
import { deploymentActions, podActions, serviceActions } from '../pods/actions'
import { clusterActions } from '../infrastructure/clusters/actions'
import { loadNodes } from '../infrastructure/nodes/actions'
import { mngmUserActions } from 'account/components/userManagement/users/actions'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import { cloudProviderActions } from '../infrastructure/cloudProviders/actions'
// Components
import StatusCard, { StatusCardProps } from './StatusCard'
import Text from 'core/elements/text'
import { routes } from 'core/utils/routes'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import Theme from 'core/themes/model'
import { SessionState, sessionStoreKey } from 'core/session/sessionReducers'
import {
  isHealthyStatus,
  isTransientStatus,
  isUnhealthyStatus,
} from '../infrastructure/clusters/ClusterStatusUtils'

export interface IStatusCardWithFilterProps extends StatusCardProps {
  permissions: string[]
}

const useStyles = makeStyles<Theme>((theme) => ({
  dashboardMosaic: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 290px)',
    gridTemplateAreas: `
      'cluster node pod cloud'
      'user tenant deployment service'
    `,
    gridGap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  cardColumn: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  cluster: {
    gridArea: 'cluster',
  },
  node: {
    gridArea: 'node',
  },
  cloud: {
    gridArea: 'cloud',
  },
  user: {
    gridArea: 'user',
  },
  tenant: {
    gridArea: 'tenant',
  },
  deployment: {
    gridArea: 'deployment',
  },
  service: {
    gridArea: 'service',
  },
  pod: {
    gridArea: 'pod',
  },
}))

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
      },
      {
        name: 'partially_healthy',
        value: clusters.filter((cluster) => cluster.healthStatus === 'partially_healthy').length,
        color: 'yellow.main',
      },
      {
        name: 'converging',
        value: clusters.filter((cluster) => isTransientStatus(cluster.healthStatus)).length,
        color: 'orange.main',
      },
      {
        name: 'unhealthy',
        value: clusters.filter((cluster) => isUnhealthyStatus(cluster.healthStatus)).length,
        color: 'red.main',
      },
    ],
    piePrimary: 'healthy',
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
    ],
    graphType: 'donut',
  }),
}

const reports = [
  {
    entity: 'user',
    permissions: ['admin'],
    route: routes.userManagement.users.path(),
    addRoute: routes.userManagement.addUser.path(),
    title: 'Users',
    icon: 'user',
    dataLoader: [mngmUserActions.list],
    quantityFn: (users) => ({
      quantity: users.length,
    }),
  },
  {
    entity: 'tenant',
    permissions: ['admin'],
    route: routes.userManagement.tenants.path(),
    addRoute: routes.userManagement.addTenant.path(),
    title: 'Tenants',
    icon: 'users-class',
    dataLoader: [mngmTenantActions.list],
    quantityFn: (tenants) => ({
      quantity: tenants.length,
    }),
  },
  {
    entity: 'deployment',
    route: routes.deployments.list.path(),
    addRoute: routes.deployments.add.path(),
    title: 'Deployments',
    icon: 'window',
    dataLoader: [deploymentActions.list, { clusterId: allKey }],
    quantityFn: (deployments) => ({
      quantity: deployments.length,
    }),
  },
  {
    entity: 'service',
    route: routes.services.list.path(),
    addRoute: routes.services.add.path(),
    title: 'Services',
    icon: 'tasks-alt',
    dataLoader: [serviceActions.list, { clusterId: allKey }],
    quantityFn: (services) => ({
      quantity: services.length,
    }),
  },
  cloudStatusCardProps,
  {
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
          value: pods.filter((pod) => pod.status.phase === 'Running').length,
          color: 'green.main',
        },
        {
          name: 'pending',
          value: pods.filter((pod) => pod.status.phase === 'Pending').length,
          color: 'orange.main',
        },
        {
          name: 'unknown',
          value: pods.filter((pod) => pod.status.phase === 'Unknown').length,
          color: 'yellow.main',
        },
        {
          name: 'failed',
          value: pods.filter((pod) => pod.status.phase === 'Failed').length,
          color: 'red.main',
        },
      ],
      piePrimary: 'running',
    }),
  },
  clusterStatusCardProps,
  nodeStatusCardProps,
]

const reportsWithPerms = (reports, role) => {
  return reports.map((report) => {
    // No permissions property means no restrictions
    if (!report.permissions) {
      return report
    }
    // remove the add action when not permitted to
    return report.permissions.includes(role) ? report : { ...report, addRoute: '' }
  })
}

const nodeHealthStatus = ({ status }) => {
  if (status === 'converging') {
    return status
  }
  return status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
}

const DashboardPage = () => {
  const classes = useStyles({})
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const displayName = session?.userDetails?.displayName

  return (
    <section className={classes.cardColumn}>
      <Text variant="h5">Welcome{displayName ? ` ${displayName}` : ''}!</Text>
      <div className={classes.dashboardMosaic}>
        {reportsWithPerms(reports, session.userDetails.role).map((report) => (
          <StatusCard key={report.route} {...report} className={classes[report.entity]} />
        ))}
      </div>
    </section>
  )
}

export default DashboardPage
