import React from 'react'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
// import KubeCLI from './KubeCLI' // commented out till we support cli links
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { capitalizeString, castBoolToStr } from 'utils/misc'
import {
  ClusterConnectionStatus,
  ClusterHealthStatus,
} from 'k8s/components/infrastructure/clusters/ClusterStatus'
import ResourceUsageTable from 'k8s/components/infrastructure/common/ResourceUsageTable'
import CreateButton from 'core/components/buttons/CreateButton'
import { both, path, omit, prop } from 'ramda'
import PrometheusAddonDialog from 'k8s/components/prometheus/PrometheusAddonDialog'
import ClusterUpgradeDialog from 'k8s/components/infrastructure/clusters/ClusterUpgradeDialog'
import ClusterDeleteDialog from './ClusterDeleteDialog'
import { Typography, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { isAdminRole } from 'k8s/util/helpers'
import { routes } from 'core/utils/routes'
import CodeBlock from 'core/components/CodeBlock'
import DateCell from 'core/components/listTable/cells/DateCell'
import { sessionStoreKey } from 'core/session/sessionReducers'
import { useSelector } from 'react-redux'
import { ActionDataKeys } from 'k8s/DataKeys'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { cloudProviderTypes } from '../cloudProviders/actions'

const useStyles = makeStyles((theme) => ({
  links: {
    display: 'grid',
    gridGap: '6px',
  },
}))

const renderUUID = (_, { uuid }) => {
  return (
    <CopyToClipboard copyText={uuid} codeBlock={false}>
      <span>{uuid}</span>
    </CopyToClipboard>
  )
}
const renderConnectionStatus = (_, cluster) => <ClusterConnectionStatus cluster={cluster} />
const renderHealthStatus = (_, cluster) => <ClusterHealthStatus cluster={cluster} />
const renderClusterLink = (links, { usage }) => <ClusterLinks links={links} usage={usage} />

const ClusterLinks = ({ links, usage }) => {
  const classes = useStyles()
  const hasGrafanaLink = !!usage && usage.grafanaLink
  if (!links && !hasGrafanaLink) {
    return null
  }
  return (
    <div className={classes.links}>
      {links.dashboard && (
        <ExternalLink className="no-wrap-text" icon="tachometer" url={links.dashboard}>
          Dashboard
        </ExternalLink>
      )}
      {links.kubeconfig && (
        <DownloadKubeConfigLink
          className="no-wrap-text"
          icon="lock"
          cluster={links.kubeconfig.cluster}
        />
      )}
      {hasGrafanaLink && (
        <ExternalLink className="no-wrap-text" icon="chart-line" url={usage.grafanaLink}>
          Grafana
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

const toMHz = (value) => value * 1024

const renderStats = (_, { usage }) => {
  const hasValidStats = !!path(['compute', 'current'], usage)
  if (!hasValidStats) {
    return null
  }
  return (
    <>
      <ResourceUsageTable valueConverter={toMHz} units="MHz" label="CPU" stats={usage.compute} />
      <ResourceUsageTable units="GiB" label="Memory" stats={usage.memory} />
      <ResourceUsageTable units="GiB" label="Storage" stats={usage.disk} />
    </>
  )
}

const renderClusterDetailLink = (name, cluster) => (
  <SimpleLink src={routes.cluster.nodes.path({ id: cluster.uuid })}>{name}</SimpleLink>
)

const renderBooleanField = (key) => (_, cluster) => (
  <Typography variant="body2">{castBoolToStr()(!!cluster[key])}</Typography>
)

const renderCloudProvider = (_, { cloudProviderType, cloudProviderName }) => (
  <Typography variant="body2">{cloudProviderType === 'local' ? '' : cloudProviderName}</Typography>
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

const canScaleMasters = ([cluster]) =>
  cluster.taskStatus === 'success' &&
  cluster.cloudProviderType === 'local' &&
  (cluster.nodes || []).length > 1
const canScaleWorkers = ([cluster]) => cluster.taskStatus === 'success'
const canUpgradeCluster = ([cluster]) => !!(cluster && cluster.canUpgrade)
const canDeleteCluster = ([row]) => !['creating', 'deleting'].includes(row.taskStatus)

const isAdmin = (selected, store) => {
  return isAdminRole(prop('session', store))
}

export const options = {
  addUrl: routes.cluster.add.path(),
  addButton: ({ onClick }) => {
    const session = useSelector(prop(sessionStoreKey))
    const {
      userDetails: { role },
    } = session
    if (role !== 'admin') {
      return null
    }
    return <CreateButton onClick={onClick}>Add Cluster</CreateButton>
  },
  columns: [
    { id: 'uuid', label: 'UUID', render: renderUUID, display: false },
    { id: 'name', label: 'Cluster name', render: renderClusterDetailLink },
    {
      id: 'connectionStatus',
      label: 'Connection status',
      render: renderConnectionStatus,
      tooltip: 'Whether the cluster is connected to the PMK management plane',
    },
    {
      id: 'healthStatus',
      label: 'Health status',
      render: renderHealthStatus,
      tooltip: 'Cluster health',
    },
    {
      id: 'links',
      label: 'Links',
      render: renderClusterLink,
    },
    {
      id: 'cloudProviderType',
      label: 'Deployment Type',
      render: (type) => cloudProviderTypes[type] || capitalizeString(type),
    },
    { id: 'resource_utilization', label: 'Resource Utilization', render: renderStats },
    { id: 'version', label: 'Kubernetes Version' },
    { id: 'created_at', label: 'Created at', render: (value) => <DateCell value={value} /> },
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
  editUrl: '/ui/kubernetes/infrastructure/clusters/edit',
  name: 'Clusters',
  title: 'Clusters',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
  deleteCond: both(isAdmin, canDeleteCluster),
  DeleteDialog: ClusterDeleteDialog,
  batchActions: [
    {
      icon: 'info-square',
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
    },
    {
      cond: both(isAdmin, canUpgradeCluster),
      icon: 'level-up',
      label: 'Upgrade Cluster',
      dialog: ClusterUpgradeDialog,
    },
    {
      cond: isAdmin,
      icon: 'chart-bar',
      label: 'Monitoring',
      dialog: PrometheusAddonDialog,
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
