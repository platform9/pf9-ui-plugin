import React, { useContext } from 'react'
import { compose } from 'app/utils/fp'
import { makeStyles, createStyles } from '@material-ui/styles'
import AppsIcon from '@material-ui/icons/Apps'
import PeopleIcon from '@material-ui/icons/People'
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'
import RecentActorsIcon from '@material-ui/icons/RecentActors'
import StorageIcon from '@material-ui/icons/Storage'
import LayersIcon from '@material-ui/icons/Layers'
import FilterNoneIcon from '@material-ui/icons/FilterNone'
import CloudIcon from '@material-ui/icons/Cloud'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import StatusCard from './status-card.tsx'
import { podActions, deploymentActions, serviceActions } from '../pods/actions'
import { clusterActions } from '../infrastructure/clusters/actions'
import { loadNodes } from '../infrastructure/nodes/actions'
import { mngmUserActions, mngmTenantActions } from '../userManagement/actions'
import { allKey } from 'app/constants'
// import { appActions } from '../apps/actions'
import { cloudProviderActions } from '../infrastructure/cloudProviders/actions'
import { pathEq } from 'ramda'

const useStyles = makeStyles(theme =>
  createStyles({
    cardRow: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap'
    },
    cardColumn: {
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap'
    }
  })
)

const serviceReports = [
  {
    route: '/ui/kubernetes/pods',
    title: 'Pods',
    icon: FilterNoneIcon,
    dataLoader: [podActions.list, { clusterId: allKey }],
    quantityFn: pods =>
      validateFieldHealthAndQuantity({
        list: pods,
        success: {
          paths: ['status.phase', 'status.phase'],
          values: ['Running', 'Succeeded']
        },
        pending: {
          paths: ['status.phase', 'status.phase'],
          values: ['Pending', 'Unknown']
        }
      })
  },
  {
    route: '/ui/kubernetes/pods#deployments',
    title: 'Deployments',
    icon: '/ui/images/dynamic_feed.svg',
    dataLoader: [deploymentActions.list, { clusterId: allKey }],
    quantityFn: deployments => ({
      quantity: deployments.length,
      working: deployments.length,
      pending: 0
    })
  },
  {
    route: '/ui/kubernetes/pods#services',
    title: 'Services',
    icon: SettingsApplicationsIcon,
    dataLoader: [serviceActions.list, { clusterId: allKey }],
    quantityFn: services =>
      validateFieldHealthAndQuantity({
        list: services,
        success: { paths: ['status'], values: ['OK'] }
      })
  },
  // {
  //   route: "/ui/kubernetes/apps",
  //   title: 'Deployed Apps',
  //   icon: AppsIcon,
  //   dataLoader: [appActions.list, { clusterId: allKey }],
  //   quantityFn: apps => ({ quantity: apps.length, working: apps.length, pending: 0 })
  // }
  {
    route: '/ui/kubernetes/infrastructure#cloudProviders',
    title: 'Clouds',
    icon: CloudIcon,
    dataLoader: [cloudProviderActions.list],
    quantityFn: clouds => ({
      quantity: clouds.length,
      working: clouds.length,
      pending: 0
    })
  }
]
const statusReports = [
  {
    route: '/ui/kubernetes/user_management#users',
    title: 'Enrolled Users',
    icon: PeopleIcon,
    dataLoader: [mngmUserActions.list],
    quantityFn: users => ({
      quantity: users.length,
      working: users.length,
      pending: 0
    })
  },
  {
    route: '/ui/kubernetes/user_management#tenants',
    title: 'Active Tenants',
    icon: RecentActorsIcon,
    dataLoader: [mngmTenantActions.list],
    quantityFn: tenants => ({
      quantity: tenants.length,
      working: tenants.length,
      pending: 0
    })
  },
  {
    route: '/ui/kubernetes/infrastructure#nodes',
    title: 'Nodes',
    icon: StorageIcon,
    dataLoader: [loadNodes],
    quantityFn: nodes =>
      validateFieldHealthAndQuantity({
        list: nodes,
        success: { paths: ['status'], values: ['ok'] }
      })
  },
  {
    route: '/ui/kubernetes/infrastructure#clusters',
    title: 'Clusters',
    icon: LayersIcon,
    dataLoader: [clusterActions.list],
    quantityFn: clusters =>
      validateFieldHealthAndQuantity({
        list: clusters,
        success: { paths: ['status'], values: ['ok'] }
      })
  }
]

const validateFieldHealthAndQuantity = ({
  list,
  success: { paths: workingPaths, values: workingValues },
  pending: { paths: pendingPaths, values: pendingValues } = {}
}) => {
  return list.reduce(
    (agg, curr) => {
      const isGoodStatus = workingPaths.some((path, idx) =>
        pathEq(path.split('.'), workingValues[idx])(curr)
      )
      const isPendingStatus = pendingPaths
        ? pendingPaths.some((path, idx) =>
          pathEq(path.split('.'), pendingValues[idx])(curr)
        )
        : false
      return {
        quantity: (agg.quantity += 1),
        working: isGoodStatus ? agg.working + 1 : agg.working,
        pending: isPendingStatus ? agg.pending + 1 : agg.pending
      }
    },
    { quantity: 0, working: 0, pending: 0 }
  )
}

const Dashboard = () => {
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
      {/* <StatusCard /> */}
    </section>
  )
}

const DashboardPage = compose(requiresAuthentication)(Dashboard)
export default DashboardPage
