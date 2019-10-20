import React, { useMemo } from 'react'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from './actions'
import UsageWidget from 'core/components/widgets/UsageWidget'
import Progress from 'core/components/progress/Progress'
import { Grid, Collapse } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import NetworksWidget from 'core/components/widgets/NetworksWidget'
import calcUsageTotals from 'k8s/util/calcUsageTotals'

const useStyles = makeStyles(theme => ({
  root: {
    alignSelf: 'normal',
    margin: theme.spacing(1, 0),
  },
}))

const InfrastructureStats = ({ visible }) => {
  const classes = useStyles()
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const totals = useMemo(() => ({
    compute: calcUsageTotals(clusters, 'usage.compute.current', 'usage.compute.max'),
    memory: calcUsageTotals(clusters, 'usage.memory.current', 'usage.memory.max'),
    disk: calcUsageTotals(clusters, 'usage.disk.current', 'usage.disk.max'),
  }), [clusters])
  // TODO: fix the number of networks
  const numNetworks = 1

  return <Collapse className={classes.root} in={visible}>
    <Progress loading={loadingClusters} renderContentOnMount minHeight={200}>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <UsageWidget title="Compute" stats={totals.compute} units="GHz" headerImg={'/ui/images/icon-compute.svg'} />
        </Grid>
        <Grid item xs={3}>
          <UsageWidget title="Memory" stats={totals.memory} units="GiB" headerImg={'/ui/images/icon-memory.svg'} />
        </Grid>
        <Grid item xs={3}>
          <UsageWidget title="Storage" stats={totals.disk} units="GiB" headerImg={'/ui/images/icon-storage.svg'} />
        </Grid>
        <Grid item xs={3}>
          <NetworksWidget numNetworks={numNetworks} />
        </Grid>
      </Grid>
    </Progress>
  </Collapse>
}

export default InfrastructureStats
