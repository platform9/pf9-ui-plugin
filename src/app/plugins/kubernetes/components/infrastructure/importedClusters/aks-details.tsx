import React from 'react'
import InfoPanel from 'core/components/InfoPanel'
import { makeStyles } from '@material-ui/styles'
import { ImportedClusterSelector } from './model'
import Theme from 'core/themes/model'
import { getFieldsForCard, IClusterDetailFields } from '../clusters/ClusterInfo'
import renderLabels from 'k8s/components/pods/renderLabels'

const renderBoolean = (bool) => (bool ? 'True' : 'False')

const renderStringArray = (array) => array.join(', ')

// Common
const clusterOverviewFields: Array<IClusterDetailFields<ImportedClusterSelector>> = [
  { id: 'spec.aks.type', title: 'Type' },
  { id: 'spec.aks.kubernetesVersion', title: 'KubernetesVersion' },
  { id: 'spec.aks.fqdn', title: 'FQDN' },
  { id: 'spec.aks.enableRBAC', title: 'Enabled RBAC', render: renderBoolean },
  { id: 'spec.aks.maxAgentPools', title: 'Max Agent Pools' },
  // { id: 'spec.aks.enablePrivateCluster', title: 'Enable Private Cluster' },
  { id: 'spec.aks.nodeResourceGroup', title: 'Node Resource Group' },
  { id: 'spec.aks.dnsPrefix', title: 'DNS Prefix' },
]

const networkingFields: Array<IClusterDetailFields<ImportedClusterSelector>> = [
  { id: 'spec.aks.network.plugin', title: 'Plugin' },
  { id: 'spec.aks.network.policy', title: 'Policy' },
  { id: 'spec.aks.network.serviceCIDR', title: 'Service CIDR' },
  { id: 'spec.aks.network.containerCIDR', title: 'Container CIDR' },
  { id: 'spec.aks.network.dnsServiceIP', title: 'DNS Service IP' },
  { id: 'spec.aks.network.outboundType', title: 'Outbound Type' },
  { id: 'spec.aks.network.loadBalancerProfile.managedOutboundIPs', title: 'Managed Outbound IPs' },
  // { id: 'spec.aks.network.loadBalancerProfile.outboundIPs', title: 'Outbound IPs' },
  // { id: 'spec.aks.network.outboundIPPrefixes', title: 'Outbound IP Prefixes' },
  // { id: 'spec.aks.network.allocatedOutboundPorts', title: 'Allocated Outbound Ports' },
  // {
  //   id: 'spec.eks.network.vpc.subnets',
  //   title: 'Subnets',
  //   render: (subnets) => subnets.map((net) => <div>{net}</div>),
  // },
]

const loadBalancerFields: Array<IClusterDetailFields<ImportedClusterSelector>> = [
  {
    id: 'spec.aks.network.loadBalancerSKU',
    title: 'Load Balancer SKU',
  },
  {
    id: 'spec.aks.network.loadBalancerProfile.effectiveOutboundIPs',
    title: 'Effective Outbound IPs',
    render: renderStringArray,
  },
]

interface Props {
  cluster: ImportedClusterSelector
  loading: boolean
  reload: any
}
const AksDetails = ({ cluster, loading, reload }: Props) => {
  const classes = useStyles({})
  const overview = getFieldsForCard(clusterOverviewFields, cluster)
  const networking = getFieldsForCard(networkingFields, cluster)
  const loadBalancer = getFieldsForCard(loadBalancerFields, cluster)

  return (
    <div className={classes.clusterInfo}>
      <InfoPanel className={classes.overview} title="Overview" items={overview} />
      <InfoPanel className={classes.networking} title="Networking" items={networking} />
      <InfoPanel className={classes.loadBalancer} title="Load Balancer" items={loadBalancer} />
      {cluster?.spec?.aks?.tags && (
        <InfoPanel
          className={classes.tags}
          title="Tags"
          customBody={renderLabels()(cluster?.spec?.aks?.tags)}
        />
      )}
    </div>
  )
}

export default AksDetails

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
    "loadBalancer tags blank"
    `,
  },
  overview: {
    gridArea: 'overview',
  },
  networking: {
    gridArea: 'networking',
  },
  loadBalancer: {
    gridArea: 'loadBalancer',
    width: '100%',
  },
  tags: {
    gridArea: 'tags',
    width: '100%',
  },
}))
