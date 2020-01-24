import React, { useContext, useState } from 'react'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
// import KubeCLI from './KubeCLI' // commented out till we support cli links
import ExternalLink from 'core/components/ExternalLink'
import SimpleLink from 'core/components/SimpleLink'
import ScaleIcon from '@material-ui/icons/TrendingUp'
import UpgradeIcon from '@material-ui/icons/PresentToAll'
import SeeDetailsIcon from '@material-ui/icons/Subject'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import { clustersCacheKey } from '../common/actions'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import { capitalizeString, castBoolToStr } from 'utils/misc'
import { ClusterConnectionStatus, ClusterHealthStatus } from 'k8s/components/infrastructure/clusters/ClusterStatus'
import ResourceUsageTable from 'k8s/components/infrastructure/common/ResourceUsageTable'
import DashboardLink from './DashboardLink'
import CreateButton from 'core/components/buttons/CreateButton'
import { AppContext } from 'core/providers/AppProvider'
import { both } from 'ramda'
import PrometheusAddonDialog from 'k8s/components/prometheus/PrometheusAddonDialog'
import ClusterUpgradeDialog from 'k8s/components/infrastructure/clusters/ClusterUpgradeDialog'
import ClusterDeleteDialog from './ClusterDeleteDialog'
import { Typography, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { isAdminRole } from 'k8s/util/helpers'
import { routes } from 'core/utils/routes'
import CodeBlock from 'core/components/CodeBlock'

const useStyles = makeStyles(theme => ({
  link: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}))

const renderCloudProviderType = (type, cluster) => {
  if (type === 'local') {
    return 'BareOS'
  }
  return capitalizeString(type)
}

const renderConnectionStatus = (_, cluster) => <ClusterConnectionStatus cluster={cluster} />
const renderHealthStatus = (_, cluster) => <ClusterHealthStatus cluster={cluster} />

const renderLinks = links => {
  if (!links) { return null }
  return (
    <div>
      {links.dashboard && <ExternalLink url={links.dashboard}>Dashboard</ExternalLink>}
      {links.kubeconfig && <DownloadKubeConfigLink cluster={links.kubeconfig.cluster} />}
      {/* {links.cli && <KubeCLI {...links.cli} />} */}
    </div>
  )
}

const renderNodeLink = ({ uuid, name }) => (
  <div key={uuid}>
    <SimpleLink src={`/ui/kubernetes/infrastructure/nodes/${uuid}`}>
      {name}
    </SimpleLink>
  </div>
)

const NodesCell = ({ nodes }) => {
  const classes = useStyles()
  const [expanded, setExpanded] = useState(false)

  if (!nodes || !nodes.length) {
    return <div>0</div>
  }
  return (
    <div>
      {expanded ? (
        <div>
          {nodes.map(renderNodeLink)}
          <Typography onClick={() => setExpanded(!expanded)} className={classes.link} component="a">
            (less details)
          </Typography>
        </div>
      ) : (
        <div>
          {nodes.length}&nbsp;
          <Typography onClick={() => setExpanded(!expanded)} className={classes.link} component="a">
            (more details)
          </Typography>
        </div>
      )}
    </div>
  )
}

const toMHz = value => value * 1024

const renderStats = (_, { usage }) => {
  const hasValidStats = usage && usage.compute && usage.compute.current
  if (!hasValidStats) { return null }
  return (
    <>
      <ResourceUsageTable valueConverter={toMHz} units="MHz" label="CPU" stats={usage.compute} />
      <ResourceUsageTable units="GiB" label="Memory" stats={usage.memory} />
      <ResourceUsageTable units="GiB" label="Storage" stats={usage.disk} />
      {usage.grafanaLink &&
      <DashboardLink label="Grafana" link={usage.grafanaLink} />}
    </>
  )
}

const renderClusterDetailLink = (name, cluster) =>
  <SimpleLink src={`/ui/kubernetes/infrastructure/clusters/${cluster.uuid}`}>{name}</SimpleLink>

const renderBooleanField = (key) => (_, cluster) => (
  <Typography variant="body2">{castBoolToStr()(!!cluster[key])}</Typography>
)

const renderCloudProvider = (_, { cloudProviderType, cloudProviderName }) => (
  <Typography variant="body2">{ cloudProviderType === 'local' ? '' : cloudProviderName }</Typography>
)

const renderMetaData = (_, { tags }) => {
  const content = JSON.stringify(tags, null, 2)

  return (
    <Tooltip title={<CodeBlock>{content}</CodeBlock>}>
      <SimpleLink src="">View</SimpleLink>
    </Tooltip>
  )
}

const canScaleMasters = ([cluster]) => cluster.taskStatus === 'success' && cluster.cloudProviderType === 'local' && (cluster.nodes || []).length > 1
const canScaleWorkers = ([cluster]) => cluster.taskStatus === 'success' && cluster.cloudProviderType !== 'azure'
const canUpgradeCluster = (selected) => false
const canDeleteCluster = ([row]) => !(['creating', 'deleting'].includes(row.taskStatus))

const isAdmin = (selected, getContext) => {
  return isAdminRole(getContext)
}

export const options = {
  addUrl: routes.cluster.add.path(),
  addButton: ({ onClick }) => {
    const { userDetails: { role } } = useContext(AppContext)
    if (role !== 'admin') {
      return null
    }
    return <CreateButton onClick={onClick}>Add Cluster</CreateButton>
  },
  columns: [
    { id: 'name', label: 'Cluster name', render: renderClusterDetailLink },
    { id: 'connectionStatus', label: 'Connection status', render: renderConnectionStatus, tooltip: 'Whether the cluster is connected to the PMK management plane' },
    { id: 'healthStatus', label: 'Health status', render: renderHealthStatus, tooltip: 'Cluster health' },
    { id: 'links', label: 'Links', render: renderLinks },
    { id: 'cloudProviderType', label: 'Deployment Type', render: renderCloudProviderType },
    { id: 'resource_utilization', label: 'Resource Utilization', render: renderStats },
    { id: 'version', label: 'Kubernetes Version' },
    { id: 'created_at', label: 'Created at' },
    { id: 'nodes', label: 'Nodes', render: nodes => <NodesCell nodes={nodes} /> },
    { id: 'networkPlugin', label: 'Network Backend' },
    { id: 'containersCidr', label: 'Containers CIDR' },
    { id: 'servicesCidr', label: 'Services CIDR' },
    { id: 'endpoint', label: 'API endpoint' },
    { id: 'cloudProviderName', label: 'Cloud provider', render: renderCloudProvider },
    { id: 'allowWorkloadsOnMaster', label: 'Master Workloads', render: renderBooleanField('allowWorkloadsOnMaster'), tooltip: 'Whether masters are enabled to run workloads' },
    { id: 'privileged', label: 'Privileged', render: renderBooleanField('privileged'), tooltip: 'Whether any container on the cluster can enable privileged mode' },
    { id: 'hasVpn', label: 'VPN', render: renderBooleanField('hasVpn') },
    { id: 'appCatalogEnabled', label: 'App Catalog', render: renderBooleanField('appCatalogEnabled'), tooltip: 'Whether helm application catalog is enabled for this cluster' },
    { id: 'hasLoadBalancer', label: 'Load Balancer', render: renderBooleanField('hasLoadBalancer') },
    { id: 'etcdBackupEnabled', label: 'etcd Backup', render: renderBooleanField('etcdBackupEnabled') },

    // TODO: We probably want to write a metadata renderer for this kind of format
    //
    // since we use it in a few places for tags / metadata.
    { id: 'tags', label: 'Metadata', render: renderMetaData },
  ],
  cacheKey: clustersCacheKey,
  editUrl: '/ui/kubernetes/infrastructure/clusters/edit',
  name: 'Clusters',
  title: 'Clusters',
  uniqueIdentifier: 'uuid',
  multiSelection: false,
  deleteCond: both(isAdmin, canDeleteCluster),
  DeleteDialog: ClusterDeleteDialog,
  batchActions: [
    {
      icon: <SeeDetailsIcon />,
      label: 'See details',
      routeTo: rows => `/ui/kubernetes/infrastructure/clusters/${rows[0].uuid}`,
    },
    {
      cond: both(isAdmin, canScaleMasters),
      icon: <ScaleIcon />,
      label: 'Scale masters',
      routeTo: rows => `/ui/kubernetes/infrastructure/clusters/scaleMasters/${rows[0].uuid}`,
    },
    {
      cond: both(isAdmin, canScaleWorkers),
      icon: <ScaleIcon />,
      label: 'Scale workers',
      routeTo: rows => `/ui/kubernetes/infrastructure/clusters/scaleWorkers/${rows[0].uuid}`,
    },
    {
      cond: both(isAdmin, canUpgradeCluster),
      icon: <UpgradeIcon />,
      label: 'Upgrade cluster',
      dialog: ClusterUpgradeDialog,
    },
    {
      cond: isAdmin,
      icon: <InsertChartIcon />,
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
