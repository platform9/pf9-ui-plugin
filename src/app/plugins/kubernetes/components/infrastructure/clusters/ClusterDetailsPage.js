import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import Progress from 'core/components/progress/Progress'
import UsageWidget from 'core/components/widgets/UsageWidget'
import { emptyObj } from 'utils/fp'

import ClusterInfo from './ClusterInfo'
import ClusterNodes from './ClusterNodes'
import PageContainer from 'core/components/pageContainer/PageContainer'
import SimpleLink from 'core/components/SimpleLink'
import { makeStyles } from '@material-ui/styles'
import { Typography, Grid } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { ClusterConnectionStatus, ClusterHealthStatus } from 'k8s/components/infrastructure/clusters/ClusterStatus'

const useStyles = makeStyles((theme) => ({
  backLink: {
    marginBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  statsContainer: {
    maxWidth: 1000,
    marginBottom: theme.spacing(3),
  },
  statusItems: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: theme.spacing(),
    '& > *': {
      marginRight: theme.spacing(2)
    }
  }
}))

const ClusterDetailsPage = () => {
  const { match } = useReactRouter()
  const classes = useStyles()
  const [clusters, loading] = useDataLoader(clusterActions.list)
  const cluster = clusters.find((x) => x.uuid === match.params.id) || {}
  const { name } = cluster
  return (
    <PageContainer
      header={
        <>
          <Typography variant="h5">Cluster {name}</Typography>
          <SimpleLink src={'/ui/kubernetes/infrastructure#clusters'} className={classes.backLink}>
            « Back to Cluster List
          </SimpleLink>
        </>
      }
    >
      <Progress loading={loading}>
        <ClusterStatusAndUsage cluster={cluster} />
        <Tabs>
          <Tab value="configuration" label="Details">
            <ClusterInfo />
          </Tab>
          <Tab value="nodesAndHealthInfo" label="Nodes & Health Info">
            <ClusterNodes />
          </Tab>
        </Tabs>
      </Progress>
    </PageContainer>
  )
}

export default ClusterDetailsPage

const ClusterStatusAndUsage = ({ cluster }) => {
  const { usage = emptyObj } = cluster
  const classes = useStyles()
  return (
    <Grid container className={classes.statsContainer}>
      <Grid item xs={4}>
        <div className={classes.statusItems}>
          <ClusterConnectionStatus cluster={cluster} variant="header" />
          <ClusterHealthStatus cluster={cluster} variant="header" />
        </div>
      </Grid>
      <Grid item xs={8}>
        <div className={classes.row}>
          <UsageWidget units="GHz" title="Compute" stats={usage.compute} />
          <UsageWidget units="GiB" title="Memory" stats={usage.memory} />
          <UsageWidget units="GiB" title="Storage" stats={usage.disk} />
        </div>
      </Grid>
    </Grid>
  )
}
