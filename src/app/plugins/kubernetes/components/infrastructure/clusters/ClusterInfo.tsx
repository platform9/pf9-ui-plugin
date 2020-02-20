import React from 'react'
import InfoPanel from 'core/components/InfoPanel'

import useReactRouter from 'use-react-router'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { path } from 'ramda'
import { ICluster } from './model'
import { CloudProviders, CloudProvidersFriendlyName } from '../cloudProviders/model'
import Theme from 'core/themes/model'
import { castBoolToStr, formatDate } from 'utils/misc'

interface IClusterDetailFields {
  id: string
  title: string
  required: boolean
  condition?: (cluster: ICluster) => boolean
  render?: (value: string | boolean) => string
}

const getFieldsForCard = (fields: IClusterDetailFields[], cluster: ICluster) => {
  const fieldsToDisplay = {}
  fields.forEach((field) => {
    const { id, title, required = false, condition, render } = field
    const shouldRender = condition ? condition(cluster) : true
    const value = path<string | boolean>(id.split('.'), cluster)
    if (shouldRender && (required || !!value || value === false)) {
      fieldsToDisplay[title] = render ? render(value) : value
    }
  })
  return fieldsToDisplay
}

// Common
const clusterOverviewFields: IClusterDetailFields[] = [
  {
    id: 'created_at',
    title: 'Cluster Created',
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
  { id: 'etcdBackupEnabled', title: 'ETCD Backup', required: true, render: castBoolToStr() },
  {
    id: 'etcdBackup.storageProperties.localPath',
    title: 'ETCD Backup Storage Path',
    required: false,
    condition: (cluster) => !!cluster.etcdBackupEnabled,
  },
  {
    id: 'etcdBackup.intervalInMins',
    title: 'ETCD Backup Interval',
    required: false,
    condition: (cluster) => !!cluster.etcdBackupEnabled,
  },
  { id: 'etcdDataDir', title: 'ETCD Data Directory', required: true },
  {
    id: 'etcdVersion',
    title: 'ETCD version',
    required: true,
    condition: (cluster) => !!cluster.etcdBackupEnabled,
  },
  { id: 'k8sApiPort', title: 'K8S API Server port', required: true },
  { id: 'mtuSize', title: 'MTU size', required: true },
  { id: 'flannelIfaceLabel', title: 'Flannel interface', required: false },
  { id: 'flannelPublicIfaceLabel', title: 'Flannel Public IP', required: false },
]

// BareOS
const bareOsNetworkingFields = [
  { id: 'networkPlugin', title: 'Network Backend', required: true },
  { id: 'hasLoadBalancer', title: 'Load Balancer', required: false, render: castBoolToStr() },
  { id: 'masterVipIface', title: 'Physical Network Interface', required: false },
  { id: 'masterVipIpv4', title: 'Virtual IP Address', required: false },
  { id: 'metallbCidr', title: 'MetalLB CIDR', required: false },
]

// AWS
const awsCloudFields = [
  { id: 'cloudProperties.region', title: 'Region', required: true },
  { id: 'cloudProperties.masterFlavor', title: 'Master Flavor', required: true },
  { id: 'cloudProperties.workerFlavor', title: 'Worker Flavor', required: true },
  { id: 'cloudProperties.sshKey', title: 'SSH Key', required: true },
  { id: 'cloudProperties.serviceFqdn', title: 'Service FQDN', required: true },
  { id: 'cloudProperties.ami', title: 'AMI', required: true },
  { id: 'cloudProperties.domainId', title: 'Domain Id', required: true },
  { id: 'cloudProperties.isPrivate', title: 'Is Private', required: true, render: castBoolToStr() },
  {
    id: 'cloudProperties.usePf9Domain',
    title: 'Use Pf9 Domain',
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
  { id: 'cloudProperties.loadbalancerIP', title: 'Load Balance IP', required: true },
]

const overviewStats = (cluster) => getFieldsForCard(clusterOverviewFields, cluster)
const bareOsNetworkingProps = (cluster) => getFieldsForCard(bareOsNetworkingFields, cluster)
const awsCloudProps = (cluster) => getFieldsForCard(awsCloudFields, cluster)
const azureCloudProps = (cluster) => getFieldsForCard(azureCloudFields, cluster)

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
  root: {
    flexGrow: 1,
  },
}))

const ClusterInfo = () => {
  const { match } = useReactRouter()
  const classes = useStyles({})
  const [clusters] = useDataLoader(clusterActions.list)
  const cluster = clusters.find((x) => x.uuid === match.params.id) || {}

  const overview = overviewStats(cluster)

  return (
    <Grid container spacing={4} className={classes.root}>
      <Grid item xs={6}>
        <InfoPanel title="Overview" items={overview} />
      </Grid>
      <Grid item xs={6}>
        {renderCloudInfo(cluster)}
      </Grid>
    </Grid>
  )
}

export default ClusterInfo
