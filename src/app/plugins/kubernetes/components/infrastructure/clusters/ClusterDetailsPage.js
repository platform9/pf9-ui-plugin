import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import clsx from 'clsx'
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
import {
  ClusterConnectionStatus,
  ClusterHealthStatus,
} from 'k8s/components/infrastructure/clusters/ClusterStatus'
import { NodeHealthWithTasksToggler } from '../nodes/ConvergingNodeBreakdown'
import { routes } from 'core/utils/routes'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import PollingData from 'core/components/PollingData'
import DownloadKubeConfigLink from './DownloadKubeConfigLink'
import ExternalLink from 'core/components/ExternalLink'

const oneSecond = 1000

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
    marginLeft: 'auto',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  statsContainer: {
    maxWidth: 1000,
    marginBottom: theme.spacing(1),
    '& .MuiGrid-item': {
      marginBottom: theme.spacing(2),
    },
  },
  statusItems: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    '& > *': {
      marginRight: theme.spacing(2),
    },
  },
  headerCardContainer: {
    minWidth: 320,
    minHeight: 175,
    display: 'grid',
    gridTemplateRows: ({ hasLinks }) => `58px 1fr 2px ${hasLinks ? 46 : 12}px`,
    paddingTop: theme.spacing(),
  },
  harderCardFooter: {
    display: 'grid',
    alignItems: 'center',
    paddingTop: theme.spacing(0.5),
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  headerCardBody: {
    display: 'block',
    margin: theme.spacing(0, 3),
  },
  headerCardHeader: {
    margin: theme.spacing(0, 2),
    display: 'grid',
    gridTemplateColumns: '1fr 38px',
    gridTemplateAreas: `
      "header icon"
      "cluster cluster"
    `,
    '& h6': {
      gridArea: 'header',
      margin: 0,
      fontSize: theme.spacing(2.5),
      color: theme.palette.text.primary,
    },
    '& p': {
      gridArea: 'cluster',
      margin: '4px 0 0px 8px',
      fontSize: theme.spacing(2),
      color: theme.palette.text.secondary,
    },
  },
  headerIcon: {
    color: theme.palette.text.secondary,
    gridArea: 'icon',
    fontSize: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalLink: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    fontSize: '12px',
    '& i': {
      marginBottom: theme.spacing(0.5),
      fontSize: theme.spacing(3),
    },
  },
}))

const ClusterDetailsPage = () => {
  const { match } = useReactRouter()
  const classes = useStyles()
  const [clusters, loading, reload] = useDataLoader(clusterActions.list)
  const cluster = clusters.find((x) => x.uuid === match.params.id) || {}
  return (
    <PageContainer
      header={
        <SimpleLink src={routes.cluster.list.path()} className={classes.backLink}>
          « Back to Cluster List
        </SimpleLink>
      }
    >
      <>
        <PollingData hidden loading={loading} onReload={reload} refreshDuration={oneSecond * 10} />
        <ClusterStatusAndUsage cluster={cluster} loading={loading} />
        <Tabs>
          <Tab value="nodes" label="Nodes">
            <ClusterNodes />
          </Tab>
          <Tab value="nodeHealth" label="Node Health">
            <NodeHealthWithTasksToggler />
          </Tab>
          <Tab value="clusterDetails" label="Cluster Details">
            <ClusterInfo />
          </Tab>
        </Tabs>
      </>
    </PageContainer>
  )
}

export default ClusterDetailsPage

const ClusterStatusAndUsage = ({ cluster, loading }) => {
  const { usage = emptyObj, name, links = emptyObj } = cluster
  const classes = useStyles()
  const clusterLinks = {
    grafana: usage.grafanaLink,
    ...links,
  }
  return (
    <Grid container className={classes.statsContainer}>
      <Grid item lg={4} className={classes.statusItems}>
        <HeaderCard title="Cluster" subtitle={name} icon="project-diagram" links={clusterLinks}>
          <ClusterConnectionStatus
            cluster={cluster}
            variant="header"
            message={loading ? 'loading' : undefined}
          />
          <ClusterHealthStatus
            cluster={cluster}
            variant="header"
            message={loading ? 'loading' : undefined}
          />
        </HeaderCard>
      </Grid>
      <Grid item lg={8} className={classes.row}>
        <UsageWidget units="GHz" title="Compute" stats={usage.compute} />
        <UsageWidget units="GiB" title="Memory" stats={usage.memory} />
        <UsageWidget units="GiB" title="Storage" stats={usage.disk} />
      </Grid>
    </Grid>
  )
}

const HeaderCard = ({ title, subtitle, icon, loading = false, links, children }) => {
  const hasLinks = !!links.grafana || !!links.dashboard || !!links.kubeconfig
  const classes = useStyles({ hasLinks })
  return (
    <Card className={classes.headerCardContainer}>
      <header className={classes.headerCardHeader}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="subtitle1" component="p">
          {subtitle}
        </Typography>
        <FontAwesomeIcon className={clsx({ 'fa-spin': loading }, classes.headerIcon)}>
          {loading ? 'sync' : icon}
        </FontAwesomeIcon>
      </header>
      <div className={classes.headerCardBody}>{children}</div>
      <hr className={classes.cardBoarder} />
      <footer className={classes.harderCardFooter}>
        {!!links.grafana && (
          <ExternalLink icon="chart-line" className={classes.verticalLink} url={links.grafana}>
            Grafana
          </ExternalLink>
        )}
        {!!links.dashboard && (
          <ExternalLink icon="tachometer" className={classes.verticalLink} url={links.dashboard}>
            Dashboard
          </ExternalLink>
        )}
        {!!links.kubeconfig && (
          <DownloadKubeConfigLink
            icon="cogs"
            className={classes.verticalLink}
            cluster={links.kubeconfig.cluster}
          />
        )}
      </footer>
    </Card>
  )
}
