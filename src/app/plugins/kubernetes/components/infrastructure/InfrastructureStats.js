import React, { useMemo } from 'react'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from './actions'
import { filter, evolve, add } from 'ramda'
import { pathStrOr, pathStr } from 'utils/fp'
import UsageWidget from 'core/components/widgets/UsageWidget'
import Progress from 'core/components/progress/Progress'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    alignSelf: 'normal',
    margin: theme.spacing(1, 0),
  },
}))

const clusterTotalsSpec = {
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
const isClusterActive = cluster => pathStr(`usage.disk.max`, cluster)
const calcTotals = clusters => {
  const activeClustersCount = filter(isClusterActive, clusters).length
  const calcUsagePercent = (strPath, cluster) =>
    pathStr(`${strPath}.max`, cluster) && activeClustersCount
      ? 100 * pathStrOr(0, `${strPath}.current`, cluster) / pathStr(`${strPath}.max`, cluster) / activeClustersCount
      : 0
  const clusterTotalsReducer = (accumulatedTotals, cluster) => evolve({
    compute: {
      current: add(pathStrOr(0, 'usage.compute.current', cluster)),
      max: add(pathStrOr(0, 'usage.compute.max', cluster)),
      percent: add(calcUsagePercent('usage.compute', cluster)),
    },
    memory: {
      current: add(pathStrOr(0, 'usage.memory.current', cluster)),
      max: add(pathStrOr(0, 'usage.memory.max', cluster)),
      percent: add(calcUsagePercent('usage.memory', cluster)),
    },
    disk: {
      current: add(pathStrOr(0, 'usage.disk.current', cluster)),
      max: add(pathStrOr(0, 'usage.disk.max', cluster)),
      percent: add(calcUsagePercent('usage.disk', cluster)),
    },
  }, accumulatedTotals)

  return clusters.reduce(clusterTotalsReducer, clusterTotalsSpec)
}

const InfrastructureStats = () => {
  const classes = useStyles()
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const totals = useMemo(() => calcTotals(clusters), [clusters])

  return <div className={classes.root}>
    <Progress loading={loadingClusters} minHeight={200}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <UsageWidget title="Compute" stats={totals.compute} headerImg={'/ui/images/icon-compute.svg'} />
        </Grid>
        <Grid item xs={4}>
          <UsageWidget title="Memory" stats={totals.memory} headerImg={'/ui/images/icon-memory.svg'} />
        </Grid>
        <Grid item xs={4}>
          <UsageWidget title="Storage" stats={totals.disk} headerImg={'/ui/images/icon-storage.svg'} />
        </Grid>
        {/* <Grid item xs={3}> */}
        {/*  TODO */}
        {/* </Grid> */}
      </Grid>
    </Progress>
  </div>
}

export default InfrastructureStats
