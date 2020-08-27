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
import StatusCard, { StatusCardProps } from './StatusCard'
import { Typography } from '@material-ui/core'
import { capitalizeString, normalizeUsername } from 'utils/misc'

import ClusterSetup, {
  clustersHaveMonitoring,
  clustersHaveAccess,
} from 'k8s/components/onboarding/ClusterSetup'
import PodSetup, { podSetupComplete } from 'k8s/components/onboarding/PodSetup'
import useDataLoader from 'core/hooks/useDataLoader'
import Progress from 'core/components/progress/Progress'
import identity from 'ramda/es/identity'
import { isAdminRole } from 'k8s/util/helpers'
import { routes } from 'core/utils/routes'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import Theme from 'core/themes/model'

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
  title: 'Clusters',
  icon: 'project-diagram',
  dataLoader: [clusterActions.list, {}],
  quantityFn: (clusters) => ({
    quantity: clusters.length,
    pieData: [
      {
        name: 'healthy',
        value: clusters.filter((cluster) => cluster.healthStatus === 'healthy').length,
        color: 'success.main',
      },
      {
        name: 'partially_healthy',
        value: clusters.filter((cluster) => cluster.healthStatus === 'partially_healthy').length,
        color: 'warning.lighter',
      },
      {
        name: 'converging',
        value: clusters.filter((cluster) => cluster.healthStatus === 'converging').length,
        color: 'warning.main',
      },
      {
        name: 'unhealthy',
        value: clusters.filter((cluster) => cluster.healthStatus === 'unhealthy').length,
        color: 'error.main',
      },
    ],
    piePrimary: 'healthy',
  }),
}
export const nodeStatusCardProps: IStatusCardWithFilterProps = {
  entity: 'node',
  permissions: ['admin'],
  route: routes.nodes.list.path(),
  addRoute: routes.nodes.download.path(),
  title: 'Nodes',
  icon: 'ball-pile',
  dataLoader: [loadNodes, {}],
  quantityFn: (nodes) => ({
    quantity: nodes.length,
    pieData: [
      {
        name: 'healthy',
        value: nodes.filter((node) => nodeHealthStatus(node) === 'healthy').length,
        color: 'success.main',
      },
      {
        name: 'unknown',
        value: nodes.filter((node) => nodeHealthStatus(node) === 'unknown').length,
        color: 'warning.main',
      },
      {
        name: 'converging',
        value: nodes.filter((node) => nodeHealthStatus(node) === 'converging').length,
        color: 'warning.lighter',
      },
      {
        name: 'unhealthy',
        value: nodes.filter((node) => nodeHealthStatus(node) === 'unhealthy').length,
        color: 'error.main',
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
          color: 'success.main',
        },
        {
          name: 'pending',
          value: pods.filter((pod) => pod.status.phase === 'Pending').length,
          color: 'warning.lighter',
        },
        {
          name: 'unknown',
          value: pods.filter((pod) => pod.status.phase === 'Unknown').length,
          color: 'warning.main',
        },
        {
          name: 'failed',
          value: pods.filter((pod) => pod.status.phase === 'Failed').length,
          color: 'error.main',
        },
      ],
      piePrimary: 'running',
    }),
  },
  clusterStatusCardProps,
  nodeStatusCardProps,
]

const reportsWithPerms = (reports) => {
  const {
    userDetails: { role },
  } = useContext(AppContext)
  return reports.map((report) => {
    // No permissions property means no restrictions
    if (!report.permissions) {
      return report
    }
    // remove the add action when not permitted to
    return report.permissions.includes(role) ? report : { ...report, addRoute: '' }
  })
}
const promptOnboardingSetup = (items: boolean[]) => {
  const isComplete = items.every(identity)
  // If any step is not ready then we need to return true to prompt for it.
  return !isComplete
}
const nodeHealthStatus = ({ status }) => {
  if (status === 'converging') {
    return status
  }
  return status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
}

const DashboardPage = () => {
  // need to be able to force update because states are captured in local storage :(
  const [, updateState] = React.useState()
  const forceUpdate = useCallback(() => updateState({}), [])

  const classes = useStyles({})
  const { getContext, session } = useContext(AppContext)
  const isAdmin = isAdminRole(getContext)

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

  const initialExpandedClusterPanel = useMemo(() => {
    return [hasClusters, hasAccess, hasMonitoring].findIndex((item) => !item)
  }, [hasClusters, hasMonitoring, hasAccess])

  const [users, loadingUsers] = useDataLoader(mngmUserActions.list)
  const user = users.find((x) => x.username === session.username)
  const displayname = user?.displayname
  const username = capitalizeString(normalizeUsername(session.username))

  if (loadingUsers) {
    return null
  }

  return (
    <section className={classes.cardColumn}>
      <Typography variant="h5">Welcome {displayname ? displayname : username}!</Typography>
      {isLoading ? (
        <Progress loading={isLoading} overlay renderContentOnMount />
      ) : (
        <>
          {showOnboarding && (
            <>
              <ClusterSetup
                initialPanel={initialExpandedClusterPanel}
                onComplete={handleComplete}
              />
              <PodSetup onComplete={handleComplete} initialPanel={showClusters ? undefined : 0} />
            </>
          )}

          {!showOnboarding && (
            <div className={classes.dashboardMosaic}>
              {reportsWithPerms(reports).map((report) => (
                <StatusCard key={report.route} {...report} className={classes[report.entity]} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default DashboardPage
