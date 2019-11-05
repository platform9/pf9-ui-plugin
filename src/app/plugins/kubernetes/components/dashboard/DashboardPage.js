// libs
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { pathEq } from 'ramda'

// Constants
import { allKey } from 'app/constants'

// Actions
import { podActions, deploymentActions, serviceActions } from '../pods/actions'
import { clusterActions } from '../infrastructure/clusters/actions'
import { loadNodes } from '../infrastructure/nodes/actions'
import { mngmUserActions } from '../userManagement/users/actions'
import { mngmTenantActions } from '../userManagement/tenants/actions'
import { cloudProviderActions } from '../infrastructure/cloudProviders/actions'

// Icons
import {
  People,
  SettingsApplications,
  RecentActors,
  Storage,
  Layers,
  FilterNone,
  Cloud,
} from '@material-ui/icons'

// Components
import StatusCard from './status-card.tsx'

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

const serviceReports = [
  {
    route: '/ui/kubernetes/pods',
    title: 'Pods',
    icon: FilterNone,
    dataLoader: [podActions.list, { clusterId: allKey }],
    quantityFn: pods =>
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
    route: '/ui/kubernetes/pods#deployments',
    title: 'Deployments',
    icon: '/ui/images/dynamic_feed.svg',
    dataLoader: [deploymentActions.list, { clusterId: allKey }],
    quantityFn: deployments => ({
      quantity: deployments.length,
      working: deployments.length,
      pending: 0,
    }),
  },
  {
    route: '/ui/kubernetes/pods#services',
    title: 'Services',
    icon: SettingsApplications,
    dataLoader: [serviceActions.list, { clusterId: allKey }],
    quantityFn: services =>
      validateFieldHealthAndQuantity({
        list: services,
        success: [{ path: 'status', value: 'OK' }],
      }),
  },
  {
    route: '/ui/kubernetes/infrastructure#cloudProviders',
    title: 'Clouds',
    icon: Cloud,
    dataLoader: [cloudProviderActions.list],
    quantityFn: clouds => ({
      quantity: clouds.length,
      working: clouds.length,
      pending: 0,
    }),
  },
]
const statusReports = [
  {
    route: '/ui/kubernetes/user_management#users',
    title: 'Enrolled Users',
    icon: People,
    dataLoader: [mngmUserActions.list],
    quantityFn: users => ({
      quantity: users.length,
      working: users.length,
      pending: 0,
    }),
  },
  {
    route: '/ui/kubernetes/user_management#tenants',
    title: 'Active Tenants',
    icon: RecentActors,
    dataLoader: [mngmTenantActions.list],
    quantityFn: tenants => ({
      quantity: tenants.length,
      working: tenants.length,
      pending: 0,
    }),
  },
  {
    route: '/ui/kubernetes/infrastructure#nodes',
    title: 'Nodes',
    icon: Storage,
    dataLoader: [loadNodes],
    quantityFn: nodes =>
      validateFieldHealthAndQuantity({
        list: nodes,
        success: [{ path: 'status', value: 'ok' }],
      }),
  },
  {
    route: '/ui/kubernetes/infrastructure#clusters',
    title: 'Clusters',
    icon: Layers,
    dataLoader: [clusterActions.list],
    quantityFn: clusters =>
      validateFieldHealthAndQuantity({
        list: clusters,
        success: [{ path: 'status', value: 'ok' }],
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

const DashboardPage = () => {
  const { cardColumn, cardRow } = useStyles()

  return (
    <section name="dashboard-status-container" className={cardColumn}>
      <div className={cardRow}>
        {statusReports.map(report => (
          <StatusCard {...report} />
        ))}
      </div>
      <div className={cardRow}>
        {serviceReports.map(report => (
          <StatusCard {...report} />
        ))}
      </div>
    </section>
  )
}

export default DashboardPage
