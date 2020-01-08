// libs
import React, { useContext, useMemo, useCallback } from 'react'
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
import { Typography } from '@material-ui/core'
import { capitalizeString, normalizeUsername } from 'utils/misc'

import ClusterSetup, {
  clustersHaveMonitoring,
  clustersHaveAccess,
} from '../onboarding/cluster-setup'
import PodSetup, { podSetupComplete } from '../onboarding/pod-setup'
import useDataLoader from 'core/hooks/useDataLoader'
import Progress from 'core/components/progress/Progress'
import identity from 'ramda/es/identity'
import { isAdminRole } from 'k8s/util/helpers'

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
    quantityFn: (deployments) => ({
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
const promptOnboardingSetup = (items: boolean[]) => {
  const isComplete = items.every(identity)
  // If any step is not ready then we need to return true to prompt for it.
  return !isComplete
}
const nodeHealthStatus = ({ status }) => {
  if (status === 'converging') { return status }
  return status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
}

const DashboardPage = () => {
  // need to be able to force update because states are captured in local storage :(
  const [, updateState] = React.useState()
  const forceUpdate = useCallback(() => updateState({}), [])

  const { cardColumn, cardRow } = useStyles({})
  const { getContext, session } = useContext(AppContext)
  const isAdmin = isAdminRole(getContext)
  const username = capitalizeString(normalizeUsername(session.username))
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const [pods, loadingPods] = useDataLoader(podActions.list)
  const hasClusters = !!clusters.length
  const hasMonitoring = clustersHaveMonitoring(clusters)
  const hasAccess = clustersHaveAccess()
  const isLoading = loadingClusters || loadingPods

  const showClusters = promptOnboardingSetup([hasClusters, hasAccess, hasMonitoring])
  const showPods = !podSetupComplete(pods)
  const showOnboarding = isAdmin && (showClusters || showPods)

  const handleComplete = useCallback(() => {
    forceUpdate()
  }, [])

  const initialExpandedClusterPanel = useMemo(
    () =>
      Math.min(
        ...[hasClusters, hasAccess, hasMonitoring].reduce(
          (ret, val, idx) => (!val ? ret.concat(idx) : ret),
          [],
        ),
      ),
    [hasClusters, hasMonitoring, hasAccess],
  )

  return (
    <section className={cardColumn}>
      <Typography variant="h5">Welcome {username}!</Typography>
      {isLoading ? (
        <Progress loading={isLoading} overlay renderContentOnMount />
      ) : (
        <>
          {showOnboarding && (
            <>
              <ClusterSetup initialPanel={initialExpandedClusterPanel} onComplete={handleComplete} />
              <PodSetup onComplete={handleComplete} initialPanel={showClusters ? undefined : 0} />
            </>
          )}

          {!showOnboarding && (
            <>
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
            </>
          )}
        </>
      )}
    </section>
  )
}

export default DashboardPage
