import React from 'react'
import InfoPanel from 'core/components/InfoPanel'
import UsageWidget from 'core/components/widgets/UsageWidget'
import useReactRouter from 'use-react-router'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import Progress from 'core/components/progress/Progress'
import { emptyObj } from 'utils/fp'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'

const overviewStats = cluster => ({
  Status:              cluster.status,
  CloudProvider:       cluster.cloudProviderName,
  'Cloud Provider Type': cluster.cloudProviderType,
  'Kubernetes Version':  cluster.version || 'unavailable',
  'Containers CIDR':     cluster.containersCidr,
  'Services CIDR':       cluster.servicesCidr,
  Privileged:          cluster.privileged,
  'Unique ID':           cluster.uuid,
})

const bareOsProps = cluster => ({
  'Load Balancer': cluster.hasLoadBalancer,
  'Physical Network Interface': cluster.masterVipIface,
  'Virtual IP Address': cluster.masterVipIpv4,
  'MetalLB CIDR': cluster.metallbCidr,
})

const awsCloudProps = cluster => ({
  Region: cluster.region,
  'Master Flavor': cluster.masterFlavor,
  'Worker Flavor': cluster.workerFlavor,
  'SSH Key': cluster.sshKey,
  'Service FQDN': cluster.serviceFqdn,
  Ami: cluster.ami,
  'Domain Id': cluster.domainId,
  'Is Private': cluster.isPrivate,
  'Use Pf9 Domain': cluster.usePf9Domain,
  'Internal Elb': cluster.internalElb,
  Azs: cluster.azs,
  /* 'Num Spot Workers': cluster.numSpotWorkers,
  'Spot Worker Flavor': cluster.spotWorkerFlavor,
  'Spot Price': cluster.spotPrice */
})

const azureCloudProps = cluster => ({
  Location: cluster.location,
  'SSH Key': cluster.sshKey,
  'Assign Public Ips': cluster.assignPublicIps,
  'Master Sku': cluster.masterSku,
  'Master Scale Set Name': cluster.masterScaleSetName,
  'Worker Sku': cluster.workerSku,
  'Worker Scale Set Name': cluster.workerScaleSetName,
  Zones: cluster.zones,
  'Primary Scale Set Name': cluster.primaryScaleSetName,
  'Resource Group': cluster.resourceGroup,
  'Security Group Name': cluster.securityGroupName,
  'Subnet Name': cluster.subnetName,
  'VNet Name': cluster.vnetName,
  'VNet Resource Name': cluster.vnetResourceGroup,
  'Load Balance IP': cluster.loadbalancerIP,
})

const renderCloudInfo = cluster => {
  switch (cluster.cloudProviderType) {
    case 'aws':
      return (
        <InfoPanel
          title="Cloud Properties"
          items={awsCloudProps(cluster.cloudProperties)}
        />
      )
    case 'local':
      return (
        <InfoPanel
          title="More Info"
          items={bareOsProps(cluster.cloudProperties)}
        />
      )
    case 'azure':
      return (
        <InfoPanel
          title="Cloud Properties"
          items={azureCloudProps(cluster.cloudProperties)}
        />
      )
    default:
      return (
        <InfoPanel title="Cloud Properties" items={{ 'Data not found': '' }} />
      )
  }
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(1)
  },
}))

const ClusterInfo = () => {
  const { match } = useReactRouter()
  const classes = useStyles()
  const [clusters, loading] = useDataLoader(clusterActions.list)
  const cluster = clusters.find(x => x.uuid === match.params.id) || {}
  const { usage = emptyObj } = cluster

  return (
    <Progress loading={loading}>
      <Grid container spacing={4} className={classes.root}>
        <Grid item xs={4}>
          <UsageWidget units="GHz" title="Compute" stats={usage.compute} />
        </Grid>
        <Grid item xs={4}>
          <UsageWidget units="GiB" title="Memory" stats={usage.memory} />
        </Grid>
        <Grid item xs={4}>
          <UsageWidget units="GiB" title="Storage" stats={usage.disk} />
        </Grid>
      </Grid>
      <Grid container spacing={4} className={classes.root}>
        <Grid item xs={6}>
          <InfoPanel title="Overview" items={overviewStats(cluster)} />
        </Grid>
        <Grid item xs={6}>
          {renderCloudInfo(cluster)}
        </Grid>
      </Grid>
    </Progress>
  )
}

export default ClusterInfo
