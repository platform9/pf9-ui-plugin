import React from 'react'
import InfoPanel from 'core/components/InfoPanel'

import useReactRouter from 'use-react-router'
import Text from 'core/elements/text'
import { makeStyles, withStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { path } from 'ramda'
import { IClusterSelector } from './model'
import { CloudProviders, CloudProvidersFriendlyName } from '../cloudProviders/model'
import Theme from 'core/themes/model'
import { castBoolToStr, formatDate } from 'utils/misc'
import ExternalLink from 'core/components/ExternalLink'
import { applicationLoadBalancer } from 'k8s/links'

export interface IClusterDetailFields<T> {
  id: string
  title: string
  required?: boolean
  helpMessage?: string | React.ReactNode
  condition?: (cluster: T) => boolean
  render?: (value: any) => string | React.ReactNode
}

export function getFieldsForCard<T>(fields: Array<IClusterDetailFields<T>>, cluster: T) {
  const fieldsToDisplay = {}
  fields.forEach((field) => {
    const { id, title, required = false, condition, render, helpMessage } = field
    const shouldRender = condition ? condition(cluster) : true
    const value = path<string | boolean>(id.split('.'), cluster)
    if (shouldRender && (required || !!value || value === false)) {
      fieldsToDisplay[title] = {
        value: render ? render(value) : value,
        helpMessage,
      }
    }
  })
  return fieldsToDisplay
}

// Common
const clusterOverviewFields: Array<IClusterDetailFields<IClusterSelector>> = [
  {
    id: 'created_at',
    title: 'Cluster Created',
    required: true,
    render: (ts: string) => formatDate(ts),
  },
  {
    id: 'lastOp',
    title: 'Cluster Updated',
    required: true,
    render: (ts: string) => formatDate(ts),
  },
  {
    id: 'cloudProviderName',
    title: 'Cloud Provider',
    required: true,
    condition: (cluster) => cluster.cloudProviderType !== CloudProviders.BareOS,
  },
  {
    id: 'cloudProviderType',
    title: 'Cloud Provider Type',
    required: true,
    render: (providerType: CloudProvidersFriendlyName) => CloudProvidersFriendlyName[providerType],
  },
  { id: 'version', title: 'Kubernetes Version', required: true },
  { id: 'containersCidr', title: 'Containers CIDR', required: true },
  { id: 'servicesCidr', title: 'Services CIDR', required: true },
  { id: 'externalDnsName', title: 'API FQDN' },
  { id: 'endpoint', title: 'API Endpoint', required: true },
  {
    id: 'allowWorkloadsOnMaster',
    title: 'Run workloads on masters',
    required: true,
    render: castBoolToStr(),
  },
  { id: 'privileged', title: 'Privileged', required: true, render: castBoolToStr() },
  { id: 'uuid', title: 'Unique ID', required: true },
  { id: 'dockerRoot', title: 'Docker Root Directory', required: true },
  { id: 'k8sApiPort', title: 'K8S API Server port', required: true },
  { id: 'mtuSize', title: 'MTU size', required: true },
  { id: 'flannelIfaceLabel', title: 'Flannel interface' },
  { id: 'flannelPublicIfaceLabel', title: 'Flannel Public IP' },
]

// BareOS
const LoadbalancerHelp = () => {
  const classes = useStyles()
  return (
    <Text className={classes.text} variant="body2">
      More about PMK application load balancer{' '}
      <ExternalLink className={classes.link} url={applicationLoadBalancer}>
        here
      </ExternalLink>
    </Text>
  )
}
const bareOsNetworkingFields = [
  { id: 'networkPlugin', title: 'Network Backend', required: true },
  {
    id: 'hasLoadBalancer',
    title: 'Application load-balancer',
    render: castBoolToStr(),
    helpMessage: <LoadbalancerHelp />,
  },
  { id: 'masterVipIface', title: 'Physical Network Interface' },
  { id: 'masterVipIpv4', title: 'Virtual IP Address' },
  { id: 'metallbCidr', title: 'MetalLB CIDR' },
]

// AWS
const awsCloudFields = [
  { id: 'cloudProperties.region', title: 'Region', required: true },
  { id: 'cloudProperties.masterFlavor', title: 'Master Flavor', required: true },
  { id: 'cloudProperties.workerFlavor', title: 'Worker Flavor', required: true },
  { id: 'cloudProperties.sshKey', title: 'SSH Key', required: true },
  { id: 'cloudProperties.serviceFqdn', title: 'Service FQDN', required: true },
  { id: 'cloudProperties.ami', title: 'AMI', required: true },
  { id: 'cloudProperties.domainId', title: 'Domain ID', required: true },
  { id: 'cloudProperties.isPrivate', title: 'Is Private', required: true, render: castBoolToStr() },
  {
    id: 'cloudProperties.usePf9Domain',
    title: 'Use PF9 Domain',
    required: true,
    render: castBoolToStr(),
  },
  {
    id: 'cloudProperties.internalElb',
    title: 'Internal ELB',
    required: true,
    render: castBoolToStr(),
  },
  { id: 'cloudProperties.azs', title: 'AZs', required: true },
]

// Azure
const azureCloudFields = [
  { id: 'cloudProperties.location', title: 'Location', required: true },
  { id: 'cloudProperties.sshKey', title: 'SSH Key', required: true },
  { id: 'cloudProperties.assignPublicIps', title: 'Assign Public Ips', required: true },
  { id: 'cloudProperties.masterSku', title: 'Master Sku', required: true },
  { id: 'cloudProperties.masterScaleSetName', title: 'Master Scale Set Name', required: true },
  { id: 'cloudProperties.workerSku', title: 'Worker Sku', required: true },
  { id: 'cloudProperties.workerScaleSetName', title: 'Worker Scale Set Name', required: true },
  { id: 'cloudProperties.zones', title: 'Zones', required: true },
  { id: 'cloudProperties.primaryScaleSetName', title: 'Primary Scale Set Name', required: true },
  { id: 'cloudProperties.resourceGroup', title: 'Resource Group', required: true },
  { id: 'cloudProperties.securityGroupName', title: 'Security Group Name', required: true },
  { id: 'cloudProperties.subnetName', title: 'Subnet Name', required: true },
  { id: 'cloudProperties.vnetName', title: 'VNet Name', required: true },
  { id: 'cloudProperties.vnetResourceGroup', title: 'VNet Resource Name', required: true },
  { id: 'cloudProperties.loadbalancerIP', title: 'Load Balancer IP', required: true },
]

interface Props {
  classes: any
  items: string[]
}

const styles = (theme) => ({
  ul: {
    listStyleType: 'none',
    paddingInlineStart: theme.spacing(0),
    margin: theme.spacing(0),
  },
})

const CsiDriversList = withStyles(styles)(({ classes, items }: Props) => {
  return (
    <ul className={classes.ul}>
      {items.map((val) => (
        <li key={val}>{val}</li>
      ))}
    </ul>
  )
})

const csiDriverFields = [
  { id: 'metadata.name', title: 'Driver Name', required: true },
  {
    id: 'spec.volumeLifecycleModes',
    title: 'Capabilities',
    required: true,
    render: (modes) => <CsiDriversList items={modes} />,
  },
]

const etcdBackupFields = [
  { id: 'etcdBackupEnabled', title: 'ETCD Backup', required: true, render: castBoolToStr() },
  {
    id: 'etcdBackup.taskStatus',
    title: 'Task Status',
    condition: (cluster) => !!cluster.etcdBackupEnabled,
  },
  {
    id: 'etcdBackup.storageProperties.localPath',
    title: 'ETCD Backup Storage Path',
    condition: (cluster) => !!cluster.etcdBackupEnabled,
  },
  {
    id: 'etcdBackup.intervalInMins',
    title: 'ETCD Backup Interval',
    condition: (cluster) => !!cluster.etcdBackupEnabled,
  },
  { id: 'etcdDataDir', title: 'ETCD Data Directory', required: true },
  {
    id: 'etcdVersion',
    title: 'ETCD version',
    required: true,
    condition: (cluster) => !!cluster.etcdBackupEnabled,
  },
]

const overviewStats = (cluster) => getFieldsForCard(clusterOverviewFields, cluster)
const bareOsNetworkingProps = (cluster) => getFieldsForCard(bareOsNetworkingFields, cluster)
const awsCloudProps = (cluster) => getFieldsForCard(awsCloudFields, cluster)
const azureCloudProps = (cluster) => getFieldsForCard(azureCloudFields, cluster)
const csiDriverProps = (driver: any) => getFieldsForCard(csiDriverFields, driver)
const etcdBackupProps = (cluster) => getFieldsForCard(etcdBackupFields, cluster)

const renderCloudInfo = (cluster) => {
  switch (cluster.cloudProviderType) {
    case 'aws':
      return <InfoPanel title="Cloud Properties" items={awsCloudProps(cluster)} />
    case 'local':
      return <InfoPanel title="Networking" items={bareOsNetworkingProps(cluster)} />
    case 'azure':
      return <InfoPanel title="Cloud Properties" items={azureCloudProps(cluster)} />
    default:
      return <InfoPanel title="Cloud Properties" items={{ 'Data not found': '' }} />
  }
}

const useStyles = makeStyles<Theme>((theme) => ({
  clusterInfo: {
    display: 'grid',
    gridTemplateColumns: 'max-content max-content',
    gridGap: '16px',
    alignItems: 'start',
    justifyItems: 'start',
  },
  column: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  card: {
    width: 'inherit',
  },
  text: {
    color: theme.palette.common.white,
  },
  link: {
    color: theme.palette.primary.light,
  },
}))

const ClusterInfo = () => {
  const { match } = useReactRouter()
  const classes = useStyles({})
  const [clusters] = useDataLoader(clusterActions.list)
  const cluster = clusters.find((x) => x.uuid === match.params.id) || {}

  const overview = overviewStats(cluster)
  const csiDrivers = cluster?.csiDrivers?.drivers || []
  const etcdBackupFields = etcdBackupProps(cluster)

  return (
    <div className={classes.clusterInfo}>
      <div className={classes.column}>
        <InfoPanel className={classes.card} title="Overview" items={overview} />
        {csiDrivers.length > 0 && (
          <InfoPanel
            className={classes.card}
            title="CSI Driver Details"
            items={csiDrivers.map(csiDriverProps)}
          />
        )}
      </div>
      <div className={classes.column}>
        {renderCloudInfo(cluster)}
        <InfoPanel className={classes.card} title="ETCD Backup" items={etcdBackupFields} />
      </div>
    </div>
  )
}

export default ClusterInfo
