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
import { Grid, Card, Typography } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { ClusterConnectionStatus, ClusterHealthStatus } from 'k8s/components/infrastructure/clusters/ClusterStatus'
import { ConvergingNodesWithTasksToggler } from '../nodes/ConvergingNodeBreakdown'
import { pathToClusters } from 'core/utils/routes'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles((theme) => ({
  cardBoarder: {
    height: 1,
    display: 'flex',
    border: 'none',
    backgroundColor: theme.palette.text.disabled,
    borderRadius: '100%',
    margin: theme.spacing(0, 1),
  },
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
    '& > *': {
      marginRight: theme.spacing(2)
    }
  },
  headerCardContainer: {
    minWidth: 300,
    minHeight: 150,
    display: 'grid',
    gridTemplateRows: '66px 1fr 1px',
    padding: theme.spacing(2, 0, 1.5, 0),
  },
  headerCardBody: {
    display: 'block',
    margin: theme.spacing(0, 3),
  },
  headerCardHeader: {
    margin: theme.spacing(0, 2),
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridTemplateAreas: `
      "header icon"
      "cluster icon"
    `,
    '& h6': {
      gridArea: 'header',
      margin: 0,
      fontSize: theme.spacing(2.5),
      color: theme.palette.text.primary,
    },
    '& p': {
      gridArea: 'cluster',
      margin: '6px 0 6px 8px',
      fontSize: theme.spacing(2),
      color: theme.palette.text.secondary,
    }
  },
  headerIcon: {
    gridArea: 'icon',
    fontSize: '36px',
    marginTop: theme.spacing(),
    color: theme.palette.dashboardCard.icon,
  },
}))

const ClusterDetailsPage = () => {
  const { match } = useReactRouter()
  const classes = useStyles()
  const [clusters, loading] = useDataLoader(clusterActions.list)
  const cluster = clusters.find((x) => x.uuid === match.params.id) || {}
  return (
    <PageContainer
      header={
        <>
          <span />
          <SimpleLink src={pathToClusters()} className={classes.backLink}>
            « Back to Cluster List
          </SimpleLink>
        </>
      }
    >
      <Progress loading={loading}>
        <ClusterStatusAndUsage cluster={cluster} />
        <Tabs>
          <Tab value="nodes" label="Nodes">
            <ClusterNodes />
          </Tab>
          <Tab value="convergingNodes" label="Converging Nodes">
            <ConvergingNodesWithTasksToggler />
          </Tab>
          <Tab value="clusterDetails" label="Cluster Details">
            <ClusterInfo />
          </Tab>
        </Tabs>
      </Progress>
    </PageContainer>
  )
}

export default ClusterDetailsPage

const ClusterStatusAndUsage = ({ cluster }) => {
  const { usage = emptyObj, name } = cluster
  const classes = useStyles()
  return (
    <Grid container className={classes.statsContainer}>
      <Grid item xs={4}>
        <div className={classes.statusItems}>
          <HeaderCard title="Cluster" subtitle={name} icon="project-diagram">
            <ClusterConnectionStatus cluster={cluster} variant="header" />
            <ClusterHealthStatus cluster={cluster} variant="header" />
          </HeaderCard>
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

const HeaderCard = ({ title, subtitle, icon, children }) => {
  const classes = useStyles()
  return (
    <Card className={classes.headerCardContainer}>
      <header className={classes.headerCardHeader}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="subtitle1" component="p">{subtitle}</Typography>
        <FontAwesomeIcon className={classes.headerIcon}>{icon}</FontAwesomeIcon>
      </header>
      <div className={classes.headerCardBody}>
        {children}
      </div>
      <hr className={classes.cardBoarder} />
    </Card>
  )
}
