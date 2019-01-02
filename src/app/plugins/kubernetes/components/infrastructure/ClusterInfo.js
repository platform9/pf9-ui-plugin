import React from 'react'
import InfoPanel from 'core/common/InfoPanel'
import UsageWidget from 'core/common/dashboard_graphs/UsageWidget'
import clusterUsageStats from './clusterUsageStats'
import { Grid } from '@material-ui/core'
import { compose } from 'ramda'
import { loadInfrastructure } from './actions'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'
import { withRouter } from 'react-router'

const overviewStats = cluster => ({
  'Status':              cluster.status,
  'CloudProvider':       cluster.cloudProviderName,
  'Cloud Provider Type': cluster.cloudProviderType,
  'Kubernetes Version':  cluster.version || 'unavailable',
  'Containers CIDR':     cluster.containersCidr,
  'Services CIDR':       cluster.servicesCidr,
  'Privileged':          cluster.privileged,
  'Unique ID':           cluster.uuid,
})

const openstackProps = cluster => ({
  'Load Balancer': cluster.hasLoadBalancer,
  'Physical Network Interface': cluster.masterVipIface,
  'Virtual IP Address': cluster.masterVipIpv4,
  'MetalLB CIDR': cluster.metallbCidr,
})

const ClusterInfo = ({ match, data, context }) => {
  const cluster = data.find(x => x.uuid === match.params.id)
  const { usage } = clusterUsageStats(cluster, context)
  return (
    <div className="root">
      <Grid container spacing={40}>
        <Grid item xs={4}>
          <UsageWidget title="Compute" stats={usage.compute} />
        </Grid>
        <Grid item xs={4}>
          <UsageWidget title="Memory" stats={usage.memory} />
        </Grid>
        <Grid item xs={4}>
          <UsageWidget title="Storage" stats={usage.disk} />
        </Grid>
      </Grid>
      <Grid container spacing={40}>
        <Grid item xs={6}>
          <InfoPanel title="Overview" items={overviewStats(cluster)} />
        </Grid>
        <Grid item xs={6}>
          <InfoPanel title="OpenStack Properties" items={openstackProps(cluster)} />
        </Grid>
      </Grid>
    </div>
  )
}

export default compose(
  withRouter,
  withAppContext,
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure }),
)(ClusterInfo)
