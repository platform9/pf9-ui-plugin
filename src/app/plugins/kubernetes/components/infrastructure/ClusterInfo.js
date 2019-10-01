import React from 'react'
import InfoPanel from 'core/components/InfoPanel'
import UsageWidget from 'core/components/dashboardGraphs/UsageWidget'
import useReactRouter from 'use-react-router'
import { Grid } from '@material-ui/core'
import { clusterActions } from './actions'
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import Progress from 'core/components/progress/Progress'
import { emptyObj } from 'utils/fp'

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
          <UsageWidget title="Compute" stats={usage.compute} />
        </Grid>
        <Grid item xs={4}>
          <UsageWidget title="Memory" stats={usage.memory} />
        </Grid>
        <Grid item xs={4}>
          <UsageWidget title="Storage" stats={usage.disk} />
        </Grid>
      </Grid>
      <Grid container spacing={4} className={classes.root}>
        <Grid item xs={6}>
          <InfoPanel title="Overview" items={overviewStats(cluster)} />
        </Grid>
        <Grid item xs={6}>
          <InfoPanel title="OpenStack Properties" items={openstackProps(cluster)} />
        </Grid>
      </Grid>
    </Progress>
  )
}

export default ClusterInfo
