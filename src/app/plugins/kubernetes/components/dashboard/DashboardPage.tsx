// libs
import React, { useEffect, useMemo } from 'react'
import { pathOr, prop } from 'ramda'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/styles'
// Constants
import { allKey, CustomerTiers, UserPreferences } from 'app/constants'
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
import { importedClusterActions } from '../infrastructure/importedClusters/actions'
import { ImportedClusterSelector } from '../infrastructure/importedClusters/model'
import OnboardingPage from '../onboarding/onboarding-page'
import useScopedPreferences from 'core/session/useScopedPreferences'
import useDataLoader from 'core/hooks/useDataLoader'
import { isDecco } from 'core/utils/helpers'

export interface IStatusCardWithFilterProps extends StatusCardProps {
  permissions: string[]
}

const useStyles = makeStyles<Theme>((theme) => ({
  dashboardMosaic: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 290px)',
    gridTemplateAreas: `
      'cluster node pod cloud'
      'deployment service user tenant'
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
  modal: {
    position: 'fixed',
    left: 0,
    top: '55px',
    width: '100vw',
    height: 'calc(100vh - 55px)', // 55px is the toolbar height
    overflow: 'auto',
    zIndex: 5000,
    backgroundColor: theme.palette.grey['100'],
    padding: theme.spacing(2, 4),
    boxSizing: 'border-box',
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

const reports = [
  {
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
  },
  {
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
  const mappedReports = reports.map((report) => {
    // No permissions property means no restrictions
    if (!report.permissions) {
      return report
    }
    // remove the add action when not permitted to
    return report.permissions.includes(role) ? report : { ...report, addRoute: '' }
  })
  const filteredReports = mappedReports.filter((report) => {
    if (!report.overallPermissions) {
      return report
    }
    return report.overallPermissions.includes(role)
  })
  return filteredReports
}

const nodeHealthStatus = ({ status }) => {
  if (status === 'converging') {
    return status
  }
  return status === 'disconnected' ? 'unknown' : status === 'ok' ? 'healthy' : 'unhealthy'
}

const DashboardPage = () => {
  const classes = useStyles({})
  const [prefs, , , updateUserDefaults] = useScopedPreferences('defaults')
  const selectSessionState = prop<string, SessionState>(sessionStoreKey)
  const session = useSelector(selectSessionState)
  const {
    username,
    userDetails: { displayName },
    features,
  } = session
  // To avoid missing API errors for ironic region UX-751
  const kubeRegion = pathOr(false, ['experimental', 'containervisor'], features)
  const customerTier = pathOr<CustomerTiers>(CustomerTiers.Freedom, ['customer_tier'], features)
  const [clusters] = useDataLoader(clusterActions.list)

  const showOnboarding = useMemo(
    () =>
      isDecco(features) &&
      customerTier === CustomerTiers.Freedom &&
      ((prefs.isOnboarded === undefined && clusters?.length === 0) ||
        (prefs.isOnboarded !== undefined && prefs.isOnboarded === false)),
    [features, customerTier, prefs.isOnboarded, clusters],
  )

  useEffect(() => {
    if (prefs.isOnboarded !== undefined) {
      return
    }
    updateUserDefaults(UserPreferences.FeatureFlags, { isOnboarded: !showOnboarding })
  }, [username, showOnboarding])

  return (
    <>
      {showOnboarding && (
        <div id="myModal" className={classes.modal}>
          <OnboardingPage />
        </div>
      )}
      {!showOnboarding && (
        <section className={classes.cardColumn} id={`dashboard-page`}>
          <Text id="dashboard-title" variant="h5">
            Welcome{displayName ? ` ${displayName}` : ''}!
          </Text>
          {kubeRegion && (
            <div className={classes.dashboardMosaic}>
              {reportsWithPerms(reports, session.userDetails.role).map((report) => (
                <StatusCard key={report.route} {...report} className={classes[report.entity]} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default DashboardPage
