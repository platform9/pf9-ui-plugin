import React from 'react'
import InfoPanel from 'core/components/InfoPanel'
import { makeStyles } from '@material-ui/styles'
import { ImportedClusterSelector } from './model'
import { CloudProviders } from '../cloudProviders/model'
import Theme from 'core/themes/model'
import { formatDate } from 'utils/misc'
import { getFieldsForCard, IClusterDetailFields } from '../clusters/ClusterInfo'
import renderLabels from 'k8s/components/pods/renderLabels'
import Text from 'core/elements/text'

const renderVPCField = (vpc: any = {}) => {
  const privateAccess = vpc?.privateAccess
  const publicAccess = vpc?.publicAccess
  const isPublicPrivateVpc = privateAccess === true && publicAccess === true
  return (
    <Text variant="body2">{`${publicAccess === true ? 'Public' : ''}${
      isPublicPrivateVpc ? ' + ' : ''
    }${privateAccess === true ? 'Private' : ''}`}</Text>
  )
}
const renderLoggingFields = (target) => (data) => {
  const tags = new Set()
  data.forEach((logging) => {
    if (target === 'enabled' && logging?.enabled) {
      // eslint doesn't recognize the ?. syntax
      // eslint-disable-next-line no-unused-expressions
      logging?.types?.forEach((logType) => tags.add(logType))
    }
    if (target === 'disabled' && !logging.enabled) {
      // eslint-disable-next-line no-unused-expressions
      logging?.types?.forEach((logType) => tags.add(logType))
    }
  })
  return Array.from(tags).map((tag) => <div>{tag}</div>)
}

const eksOverviewFields: Array<IClusterDetailFields<ImportedClusterSelector>> = [
  { id: 'spec.eks.eksVersion', title: 'EKS Version', required: true },
  { id: 'spec.eks.network.vpc.clusterSecurityGroupId', title: 'Cluster Security Group ID' },
]

// Common
const clusterOverviewFields: Array<IClusterDetailFields<ImportedClusterSelector>> = [
  { id: 'status.controlPlaneEndpoint', title: 'Api Server Endpoint' },
  {
    id: 'created_at',
    title: 'Cluster Created',
    required: true,
    render: (ts) => formatDate(ts),
  },
]

const networkingFields: Array<IClusterDetailFields<ImportedClusterSelector>> = [
  { id: 'spec.eks.network.vpc', title: 'VPC', required: true, render: renderVPCField },
  { id: 'containerCidr', title: 'Container CIDR', required: true },
  { id: 'servicesCidr', title: 'Services CIDR', required: true },
  { id: 'spec.eks.network.vpc.vpcId', title: 'VPC ID', required: true },
  {
    id: 'spec.eks.network.vpc.subnets',
    title: 'Subnets',
    render: (subnets) => subnets.map((net) => <div>{net}</div>),
  },
]
const loggingFields: Array<IClusterDetailFields<ImportedClusterSelector>> = [
  {
    id: 'spec.eks.logging.clusterLogging',
    title: 'Enabled',
    render: renderLoggingFields('enabled'),
  },
  {
    id: 'spec.eks.logging.clusterLogging',
    title: 'Disabled',
    render: renderLoggingFields('disabled'),
  },
]

const providerSpecificFields = {
  [CloudProviders.EKS]: eksOverviewFields,
}

interface Props {
  cluster: ImportedClusterSelector
  loading: boolean
  reload: any
}
const ClusterInfo = ({ cluster, loading, reload }: Props) => {
  const classes = useStyles({})
  const provider = cluster?.metadata?.labels?.provider
  const overviewFields = [...providerSpecificFields[provider], ...clusterOverviewFields]
  const overview = getFieldsForCard(overviewFields, cluster)
  const networking = getFieldsForCard(networkingFields, cluster)
  const logging = getFieldsForCard(loggingFields, cluster)

  return (
    <div className={classes.clusterInfo}>
      <InfoPanel className={classes.overview} title="Overview" items={overview} />
      <InfoPanel className={classes.networking} title="Networking" items={networking} />
      <InfoPanel className={classes.logging} title="Logging" items={logging} />
      {cluster?.spec?.eks?.tags && (
        <InfoPanel
          className={classes.tags}
          title="Tags"
          customBody={renderLabels()(cluster?.spec?.eks?.tags)}
        />
      )}
    </div>
  )
}

export default ClusterInfo

const useStyles = makeStyles<Theme>((theme) => ({
  clusterInfo: {
    display: 'grid',
    gridTemplateColumns: 'max-content max-content',
    gridTemplateRows: 'max-content max-content',
    gridGap: '16px',
    alignItems: 'stretch',
    justifyItems: 'start',
    marginTop: theme.spacing(2),
    maxWidth: 1100,
    gridTemplateAreas: `
    "overview overview networking"
    "logging tags blank"
    `,
  },
  overview: {
    gridArea: 'overview',
  },
  networking: {
    gridArea: 'networking',
  },
  logging: {
    gridArea: 'logging',
    width: '100%',
  },
  tags: {
    gridArea: 'tags',
    width: '100%',
  },
}))
