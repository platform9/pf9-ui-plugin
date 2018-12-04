import React from 'react'
import { withRouter } from 'react-router'
import { withAppContext } from 'core/AppContext'
import { compose } from 'ramda'
import { loadInfrastructure } from './actions'
import { withDataLoader } from 'core/DataLoader'
import InfoPanel from 'core/common/InfoPanel'
import {
  Grid,
  Paper,
  Typography,
} from '@material-ui/core'

const Title = ({ children }) => <Typography variant="h6">{children}</Typography>
// Just a placeholder for now
const UtilizationWidget = ({ title, stats }) => <Paper><Title>{title}</Title></Paper>

const overviewStats = cluster => ({
  'Status':              cluster.status,
  'CloudProvider':       cluster.cloudProviderName,
  'Cloud Provider Type': cluster.cloudProviderType,
  'Kubernetes Version':  cluster.version,
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

const ClusterInfo = ({ match, data }) => {
  const cluster = data.find(x => x.uuid === match.params.id)
  return (
    <div className="root">
      <Grid container spacing={40}>
        <Grid item xs={4}>
          <UtilizationWidget title="Compute" />
        </Grid>
        <Grid item xs={4}>
          <UtilizationWidget title="Memory" />
        </Grid>
        <Grid item xs={4}>
          <UtilizationWidget title="Storage" />
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
