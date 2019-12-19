// libs
import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/styles'
import { pathEq } from 'ramda'
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
import { Typography } from '@material-ui/core'
import { capitalizeString, normalizeUsername } from 'utils/misc'

import ClusterSetup from '../onboarding/cluster-setup'

const useStyles = makeStyles((theme) => ({
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

const serviceReports = [
  {
    entity: 'pod',
    route: '/ui/kubernetes/pods',
    addRoute: '/ui/kubernetes/pods/add',
    title: 'Pods',
    icon: 'cubes',
    dataLoader: [podActions.list, { clusterId: allKey }],
    quantityFn: (pods) =>
      validateFieldHealthAndQuantity({
        list: pods,
        success: [
          { path: 'status.phase', value: 'Running' },
          { path: 'status.phase', value: 'Succeeded' },
        ],
        pending: [
          { path: 'status.phase', value: 'Pending' },
          { path: 'status.phase', value: 'Unknown' },
        ],
      }),
  },
  {
    entity: 'deployment',
    route: '/ui/kubernetes/pods#deployments',
    addRoute: '/ui/kubernetes/pods/deployments/add',
    title: 'Deployments',
    icon: 'window',
    dataLoader: [deploymentActions.list, { clusterId: allKey }],
    quantityFn: (deployments) => ({
      quantity: deployments.length,
      working: deployments.length,
      pending: 0,
    }),
  },
  {
    entity: 'service',
    route: '/ui/kubernetes/pods#services',
    addRoute: '/ui/kubernetes/pods/services/add',
    title: 'Services',
    icon: 'tasks-alt',
    dataLoader: [serviceActions.list, { clusterId: allKey }],
    quantityFn: (services) =>
      validateFieldHealthAndQuantity({
        list: services,
        success: [{ path: 'status', value: 'OK' }],
      }),
  },
  {
    entity: 'cloud',
    permissions: ['admin'],
    route: '/ui/kubernetes/infrastructure#cloudProviders',
    addRoute: '/ui/kubernetes/infrastructure/cloudProviders/add',
    title: 'Cloud Accounts',
    icon: 'cloud',
    dataLoader: [cloudProviderActions.list],
    quantityFn: (clouds) => ({
      quantity: clouds.length,
      working: clouds.length,
      pending: 0,
    }),
  },
]
const statusReports = [
  {
    entity: 'user',
    permissions: ['admin'],
    route: '/ui/kubernetes/user_management#users',
    addRoute: '/ui/kubernetes/user_management/users/add',
    title: 'Users',
    icon: 'user',
    dataLoader: [mngmUserActions.list],
    quantityFn: (users) => ({
      quantity: users.length,
      working: users.length,
      pending: 0,
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
    quantityFn: (tenants) => ({
      quantity: tenants.length,
      working: tenants.length,
      pending: 0,
    }),
  },
  {
    entity: 'node',
    permissions: ['admin'],
    route: '/ui/kubernetes/infrastructure#nodes',
    addRoute: '/ui/kubernetes/infrastructure/nodes/cli/download',
    title: 'Nodes',
    icon: 'ball-pile',
    dataLoader: [loadNodes],
    quantityFn: (nodes) =>
      validateFieldHealthAndQuantity({
        list: nodes,
        success: [{ path: 'status', value: 'ok' }],
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
    quantityFn: (clusters) =>
      validateFieldHealthAndQuantity({
        list: clusters,
        success: [{ path: 'status', value: 'ok' }],
        pending: [{ path: 'status', value: 'pending' }],
      }),
  },
]

const validateFieldHealthAndQuantity = ({ list, success, pending = [] }) => {
  return list.reduce(
    (agg, curr) => {
      const isWorkingStatus = success.some(({ path, value }) =>
        pathEq(path.split('.'), value)(curr),
      )
      const isPendingStatus = pending.some(({ path, value }) =>
        pathEq(path.split('.'), value)(curr),
      )
      return {
        quantity: (agg.quantity += 1),
        working: isWorkingStatus ? agg.working + 1 : agg.working,
        pending: isPendingStatus ? agg.pending + 1 : agg.pending,
      }
    },
    { quantity: 0, working: 0, pending: 0 },
  )
}

const reportsWithPerms = (reports) => {
  const {
    userDetails: { role },
  } = useContext(AppContext)
  return reports.filter((report) => {
    // No permissions property means no restrictions
    if (!report.permissions) {
      return true
    }
    return report.permissions.includes(role)
  })
}

const DashboardPage = () => {
  const { cardColumn, cardRow } = useStyles()
  const { session } = useContext(AppContext)
  const username = capitalizeString(normalizeUsername(session.username))
  return (
    <section name="dashboard-status-container" className={cardColumn}>
      <Typography variant="h5">Welcome {username}!</Typography>
      <ClusterSetup />

      {false && (
        <>
          <div className={cardRow}>
            {reportsWithPerms(statusReports).map((report) => (
              <StatusCard key={report.route} {...report} />
            ))}
          </div>
          <div className={cardRow}>
            {reportsWithPerms(serviceReports).map((report) => (
              <StatusCard key={report.route} {...report} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default DashboardPage
