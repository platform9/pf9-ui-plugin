import React, { useMemo } from 'react'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from './actions'
import { evolve, add } from 'ramda'
import { pathStrOr, pathStr } from 'utils/fp'
import UsageWidget from 'core/components/dashboardGraphs/UsageWidget'
import Progress from 'core/components/progress/Progress'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const totalsSpec = {
  compute: {
    current: 0,
    max: 0,
    percent: 0,
    units: 'GHz',
    type: 'used',
  },
  memory: {
    current: 0,
    max: 0,
    percent: 0,
    units: 'GiB',
    type: 'used',
  },
  disk: {
    current: 0,
    max: 0,
    percent: 0,
    units: 'GiB',
    type: 'used',
  },
}

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1, 0),
  },
}))

const calcUsagePercent = (strPath, node, numClusters) =>
  100 * pathStrOr(0, `${strPath}.current`, node) / (pathStr(`${strPath}.max`, node) || 1) / numClusters

const InfrastructureStats = () => {
  const classes = useStyles()
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const totals = useMemo(() => {
    const specReducer = (acc, cluster) => evolve({
      compute: {
        current: add(pathStrOr(0, 'usage.compute.current', cluster)),
        max: add(pathStrOr(0, 'usage.compute.max', cluster)),
        percent: add(calcUsagePercent('usage.compute', cluster, clusters.length)),
      },
      memory: {
        current: add(pathStrOr(0, 'usage.memory.current', cluster)),
        max: add(pathStrOr(0, 'usage.memory.max', cluster)),
        percent: add(calcUsagePercent('usage.memory', cluster, clusters.length)),
      },
      disk: {
        current: add(pathStrOr(0, 'usage.disk.current', cluster)),
        max: add(pathStrOr(0, 'usage.disk.max', cluster)),
        percent: add(calcUsagePercent('usage.disk', cluster, clusters.length)),
      },
    }, acc)
    return clusters.reduce(specReducer, totalsSpec)
  }, [clusters])

  return <Progress loading={loadingClusters} minHeight={200}>
    <Grid container spacing={4} className={classes.root}>
      <Grid item xs={4}>
        <UsageWidget title="Compute" stats={totals.compute} headerImg={'/ui/images/icon-compute.svg'} />
      </Grid>
      <Grid item xs={4}>
        <UsageWidget title="Memory" stats={totals.memory} headerImg={'/ui/images/icon-memory.svg'} />
      </Grid>
      <Grid item xs={4}>
        <UsageWidget title="Storage" stats={totals.disk} headerImg={'/ui/images/icon-storage.svg'} />
      </Grid>
      <Grid item xs={3}>
        {/* TODO Networks */}
      </Grid>
    </Grid>
  </Progress>
}

export default InfrastructureStats
