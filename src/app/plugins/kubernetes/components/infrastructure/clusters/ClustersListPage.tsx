import { Tooltip } from '@material-ui/core'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
// import CreateButton from 'core/components/buttons/CreateButton'
import CodeBlock from 'core/components/CodeBlock'
import CopyToClipboard from 'core/components/CopyToClipboard'
// import KubeCLI from './KubeCLI' // commented out till we support cli links
import ExternalLink from 'core/components/ExternalLink'
import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import SimpleLink from 'core/components/SimpleLink'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { routes } from 'core/utils/routes'
import {
  ClusterApiServerHealthStatus,
  ClusterConnectionStatus,
  ClusterHealthStatus,
} from 'k8s/components/infrastructure/clusters/ClusterStatus'
import ClusterUpgradeDialog from 'k8s/components/infrastructure/clusters/ClusterUpgradeDialog'
import { ActionDataKeys } from 'k8s/DataKeys'
import { both, omit, prop } from 'ramda'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { capitalizeString, castBoolToStr } from 'utils/misc'
import { cloudProviderTypes } from '../cloudProviders/selectors'
import ClusterDeleteDialog from './ClusterDeleteDialog'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
import ResourceUsageTables from '../common/ResourceUsageTables'
import {
  isAdmin,
  canDeleteCluster,
  canScaleMasters,
  canScaleWorkers,
  canUpgradeCluster,
  isAzureAutoscalingCluster,
} from './helpers'
import { IClusterSelector } from './model'
import { isTransientStatus } from './ClusterStatusUtils'
import { clockDriftDetectedInNodes } from '../nodes/helper'

const useStyles = makeStyles((theme) => ({
  links: {
    display: 'grid',
    // gridGap: '2px',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    display: 'flex',
    '& i': {
      fontSize: '12px',
      height: '11px',
      width: '14px',
      alignItems: 'center',
      justifyContent: 'center',
      display: 'inline-flex',
    },
  },
}))

const renderUUID = (_, { uuid }) => {
  return (
    <CopyToClipboard copyText={uuid} codeBlock={false}>
      <span>{uuid}</span>
    </CopyToClipboard>
  )
}
const renderConnectionStatus = (_, cluster) => (
  <ClusterConnectionStatus
    iconStatus={cluster.connectionStatus === 'converging'}
    cluster={cluster}
  />
)
const renderPlatform9ComponentsStatus = (_, cluster) => {
  const showIconStatus = cluster.connectionStatus === 'converging' || cluster.status === 'pending'
  return <ClusterHealthStatus iconStatus={showIconStatus} cluster={cluster} />
}

const renderApiServerHealth = (_, cluster) => <ClusterApiServerHealthStatus cluster={cluster} />

const renderClusterLink = (links, { usage }) => <ClusterLinks links={links} usage={usage} />

const ClusterLinks = ({
  links,
  usage,
}: {
  links: IClusterSelector['links']
  usage: IClusterSelector['usage']
}) => {
  const classes = useStyles()
  const hasGrafanaLink = !!usage && usage.grafanaLink
  if (!links && !hasGrafanaLink) {
    return null
  }
  return (
    <div className={classes.links}>
      {links.dashboard && (
        <ExternalLink
          className={`${classes.icon} no-wrap-text`}
          // icon="tachometer"
          url={links.dashboard}
        >
          dashboard
        </ExternalLink>
      )}
      {links.kubeconfig && (
        <DownloadKubeConfigLink
          className={`${classes.icon} no-wrap-text`}
          // icon="lock"
          cluster={links.kubeconfig.cluster}
        />
      )}
      {hasGrafanaLink && (
        <ExternalLink
          className={`${classes.icon} no-wrap-text`}
          // icon="chart-line"
          url={usage.grafanaLink}
        >
          grafana
        </ExternalLink>
      )}
    </div>
  )
}

const renderNodeLink = (_, { uuid, nodes }) => {
  if (!nodes || !nodes.length) {
    return <div>0</div>
  }
  return <SimpleLink src={routes.cluster.nodes.path({ id: uuid })}>View {nodes.length}</SimpleLink>
}

const renderStats = (_, { usage }) => <ResourceUsageTables usage={usage} />

const renderK8sVersion = (_, cluster) => <K8sVersion cluster={cluster} />

const upgradeClusterHelpText =
  'An upgrade to newer version of Kubernetes is now available for this cluster. Click here or select the upgrade action for the cluster to see more details.'

const K8sVersion = ({ cluster }) => {
  const { version, canUpgrade, upgradingTo, taskStatus } = cluster
  const [showDialog, setShowDialog] = useState(false)
  return (
    <div>
      <Text variant="body2">{version}</Text>
      {canUpgrade && !upgradingTo && (
        <Tooltip title={upgradeClusterHelpText}>
          <SimpleLink src={routes.cluster.upgrade.path({ id: cluster.uuid })}>
            Upgrade Available
          </SimpleLink>
        </Tooltip>
      )}
      {!isTransientStatus(taskStatus) && upgradingTo && (
        <Tooltip title={upgradeClusterHelpText}>
          <SimpleLink src={routes.cluster.upgrade.path({ id: cluster.uuid })}>
            Continue Upgrade
          </SimpleLink>
        </Tooltip>
      )}
      {showDialog && <ClusterUpgradeDialog rows={[cluster]} onClose={() => setShowDialog(false)} />}
    </div>
  )
}

const renderClusterDetailLink = (name, cluster) => (
  <SimpleLink src={routes.cluster.nodes.path({ id: cluster.uuid })}>{name}</SimpleLink>
)

const renderBooleanField = (key) => (_, cluster) => (
  <Text variant="body2">{castBoolToStr()(!!cluster[key])}</Text>
)

const renderCloudProvider = (_, { cloudProviderType, cloudProviderName }) => (
  <Text variant="body2">{cloudProviderType === 'local' ? '' : cloudProviderName}</Text>
)

const renderMetaData = (_, { tags }) => {
  // Hide pf9-system:monitoring tag from the display
  // because that tag should be handled completely by appbert
  const _tags = omit(['pf9-system:monitoring'], tags)
  const content = JSON.stringify(_tags, null, 2)

  return (
    <Tooltip title={<CodeBlock>{content}</CodeBlock>}>
      <SimpleLink src="">View</SimpleLink>
    </Tooltip>
  )
}

export const options = {
  addButtonConfigs: [
    {
      label: 'Create Cluster',
      link: routes.cluster.add.path(),
      cond: () => {
        const session = useSelector(prop(sessionStoreKey))
        const {
          userDetails: { role },
        }: any = session
        return role === 'admin'
      },
    },
    {
      label: 'Import Cluster',
      link: routes.cluster.import.root.path(),
      cond: () => {
        const session = useSelector(prop(sessionStoreKey))
        const {
          userDetails: { role },
          features,
        }: any = session
        return role === 'admin' && features?.experimental?.kplane
      },
    },
  ],
  addText: 'Add Cluster',
  columns: [
    { id: 'uuid', label: 'UUID', render: renderUUID, display: false },
    { id: 'name', label: 'Name', render: renderClusterDetailLink },
    {
      id: 'connectionStatus',
      label: 'Connection status',
      render: renderConnectionStatus,
      tooltip: 'Whether the cluster is connected to the PMK management plane',
    },
    {
      id: 'platform9Components',
      label: 'Platform9 Components',
      render: renderPlatform9ComponentsStatus,
      tooltip: 'Platform9 Components  Status',
    },
    {
      id: 'apiServerHealth',
      label: 'API Server Health',
      render: renderApiServerHealth,
    },
    {
      id: 'links',
      label: 'Links',
      render: renderClusterLink,
    },
    {
      id: 'cloudProviderType',
      label: 'Deployment',
      render: (type) => cloudProviderTypes[type] || capitalizeString(type),
    },
    { id: 'resource_utilization', label: 'Resource Utilization', render: renderStats },
    { id: 'version', label: 'K8 Version', render: renderK8sVersion },
    {
      id: 'created_at',
      label: 'Created at',
      render: (value) => <DateAndTime value={value} />,
    },
    {
      id: 'lastOp',
      label: 'Updated at',
      render: (value) => <DateAndTime value={value} />,
    },
    { id: 'nodes', label: 'Nodes', render: renderNodeLink },
    { id: 'networkPlugin', label: 'Network Backend' },
    { id: 'containersCidr', label: 'Containers CIDR' },
    { id: 'servicesCidr', label: 'Services CIDR' },
    { id: 'endpoint', label: 'API endpoint' },
    { id: 'cloudProviderName', label: 'Cloud provider', render: renderCloudProvider },
    {
      id: 'allowWorkloadsOnMaster',
      label: 'Master Workloads',
      render: renderBooleanField('allowWorkloadsOnMaster'),
      tooltip: 'Whether masters are enabled to run workloads',
    },
    {
      id: 'privileged',
      label: 'Privileged',
      render: renderBooleanField('privileged'),
      tooltip: 'Whether any container on the cluster can enable privileged mode',
    },
    { id: 'hasVpn', label: 'VPN', render: renderBooleanField('hasVpn') },
    {
      id: 'appCatalogEnabled',
      label: 'App Catalog',
      render: renderBooleanField('appCatalogEnabled'),
      tooltip: 'Whether helm application catalog is enabled for this cluster',
    },
    {
      id: 'hasLoadBalancer',
      label: 'Load Balancer',
      render: renderBooleanField('hasLoadBalancer'),
    },
    {
      id: 'etcdBackupEnabled',
      label: 'etcd Backup',
      render: renderBooleanField('etcdBackupEnabled'),
    },

    // TODO: We probably want to write a metadata renderer for this kind of format
    //
    // since we use it in a few places for tags / metadata.
    { id: 'tags', label: 'Metadata', render: renderMetaData },
  ],
  cacheKey: ActionDataKeys.Clusters,
  editUrl: (_, id) => routes.cluster.edit.path({ id }),
  name: 'Clusters',
  title: 'Clusters',
  uniqueIdentifier: 'uuid',
  searchTargets: ['name', 'uuid'],
  multiSelection: false,
  deleteCond: both(isAdmin, canDeleteCluster),
  DeleteDialog: ClusterDeleteDialog,
  batchActions: [
    {
      icon: 'info-circle',
      label: 'Details',
      routeTo: (rows) => `/ui/kubernetes/infrastructure/clusters/${rows[0].uuid}`,
    },
    {
      cond: both(isAdmin, canScaleMasters),
      icon: 'expand-alt',
      label: 'Scale Masters',
      routeTo: (rows) => `/ui/kubernetes/infrastructure/clusters/scaleMasters/${rows[0].uuid}`,
    },
    {
      cond: both(isAdmin, canScaleWorkers),
      icon: 'expand-alt',
      label: 'Scale Workers',
      routeTo: (rows) => `/ui/kubernetes/infrastructure/clusters/scaleWorkers/${rows[0].uuid}`,
      disabledInfo: ([cluster]) =>
        !!cluster && isAzureAutoscalingCluster(cluster)
          ? 'Scaling Azure autoscaling clusters is not yet supported'
          : 'Cannot scale workers: cluster is busy',
    },
    {
      cond: both(isAdmin, canUpgradeCluster),
      icon: 'level-up',
      label: 'Upgrade Clusters',
      routeTo: (rows) => `/ui/kubernetes/infrastructure/clusters/${rows[0].uuid}/upgrade`,
      disabledInfo: ([cluster]) =>
        !!cluster && clockDriftDetectedInNodes(cluster.nodes)
          ? 'Cannot upgrade cluster: clock drift detected in at least one node'
          : 'Cannot upgrade cluster',
    },
    // Disable logging till all CRUD features for log datastores are implemented.
    /* {
      cond: false,
      icon: <DescriptionIcon />,
      label: 'Logging',
      dialog: LoggingAddonDialog,
    }, */
  ],
}

const { ListPage, List } = createCRUDComponents(options)
export const NodesList = List

export default ListPage
