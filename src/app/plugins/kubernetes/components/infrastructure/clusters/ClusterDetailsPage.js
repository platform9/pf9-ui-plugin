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
import { Card, Tooltip } from '@material-ui/core'
import Text from 'core/elements/text'
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
import { capitalizeString, cleanupStacktrace } from 'utils/misc'
import { cloudProviderTypes } from 'k8s/components/infrastructure/cloudProviders/selectors'
import { variantIcon } from 'core/components/Alert'
import CodeBlock from 'core/components/CodeBlock'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { hexToRGBA } from 'core/utils/colorHelpers'

const oneSecond = 1000

const useStyles = makeStyles((theme) => ({
  pageContainer: {
    position: 'relative',
  },
  backLink: {
    position: 'absolute',
    right: 0,
    top: 8,
    zIndex: 100,
    ...theme.typography.caption2,
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
    width: 424,
    minHeight: 175,
    display: 'grid',
    gridTemplateRows: ({ hasLinks }) => `62px 1fr ${hasLinks ? 56 : 12}px`,
    paddingTop: theme.spacing(),
    backgroundColor: theme.palette.grey['000'],
    border: `solid 1px ${theme.palette.grey[300]}`,
    borderRadius: 4,
  },
  harderCardFooter: {
    display: 'grid',
    alignItems: 'center',
    paddingTop: theme.spacing(0.5),
    gridTemplateColumns: 'repeat(3, 1fr)',
    background: theme.palette.grey[100],
    borderTop: `solid 1px ${theme.palette.grey[300]}`,
  },
  headerCardBody: {
    display: 'block',
    margin: theme.spacing(0, 4),
  },
  headerCardHeader: {
    margin: theme.spacing(0.5, 3, 0, 3),
    display: 'grid',
    gridTemplateColumns: '1fr 38px',
    gridTemplateAreas: `
      "header icon"
      "cluster cluster"
    `,
    '& h1': {
      gridArea: 'header',
      margin: 0,
      color: theme.palette.grey[700],
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    '& p': {
      gridArea: 'cluster',
      margin: '4px 0 0px 8px',
      color: theme.palette.grey[700],
    },
  },
  statusColor: {
    color: theme.palette.grey[700],
  },
  headerIcon: {
    color: theme.palette.grey[700],
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
    ...theme.typography.caption3,
    '& i': {
      marginBottom: theme.spacing(0.5),
      fontSize: 22,
    },
  },
  tabContainer: {
    paddingTop: theme.spacing(2),
    maxWidth: 1234,
  },
  detailsHeader: {
    display: 'grid',
    gridTemplateColumns: '434px repeat(3, 250px)',
    gridGap: theme.spacing(2),
    paddingBottom: 20,
  },
  taskErrorMessage: {
    maxHeight: 165,
    fontSize: 14,
    padding: theme.spacing(0, 2),
    margin: 0,
    marginTop: theme.spacing(2),
    backgroundColor: 'transparent',
    color: theme.palette.red[500],
    fontWeight: 300,
    lineHeight: '15px',
  },
  taskErrorAlert: {
    maxHeight: 224,
    padding: theme.spacing(0, 2, 2, 2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.red[500]}`,
    backgroundColor: hexToRGBA(theme.palette.red[500], 0.1),
    borderRadius: 4,

    '& > header': {
      color: theme.palette.red[500],
      borderBottom: `1px solid ${theme.palette.red[500]}`,
      display: 'grid',
      gridGap: theme.spacing(),
      gridTemplateColumns: '22px 1fr 22px',
      fontSize: 14,
      height: 40,
      alignItems: 'center',
    },
  },
}))

const ClusterTaskError = ({ taskError }) => {
  const classes = useStyles()
  const formattedError = cleanupStacktrace(taskError)
  return (
    <div className={classes.taskErrorAlert}>
      <header>
        <FontAwesomeIcon>{variantIcon.error}</FontAwesomeIcon>
        <Text variant="caption1">Error Impacting Cluster Availability</Text>
        <CopyToClipboard copyText={formattedError} copyIcon="copy" codeBlock={false} />
      </header>
      <CodeBlock className={classes.taskErrorMessage}>{formattedError}</CodeBlock>
    </div>
  )
}

const ClusterDetailsPage = () => {
  const { match } = useReactRouter()
  const classes = useStyles()
  const [clusters, loading, reload] = useDataLoader(clusterActions.list, undefined, {
    loadingFeedback: false,
  })
  const cluster = clusters.find((x) => x.uuid === match.params.id) || {}
  const clusterHeader = (
    <>
      <ClusterStatusAndUsage cluster={cluster} loading={loading} />
      {cluster.taskError && <ClusterTaskError taskError={cluster.taskError} />}
    </>
  )
  return (
    <PageContainer className={classes.pageContainer}>
      <PollingData hidden loading={loading} onReload={reload} refreshDuration={oneSecond * 30} />
      <SimpleLink src={routes.cluster.list.path()} className={classes.backLink}>
        « Back to Cluster List
      </SimpleLink>
      <Tabs>
        <Tab value="nodes" label="Nodes">
          <div className={classes.tabContainer}>
            {clusterHeader}
            <ClusterNodes />
          </div>
        </Tab>
        <Tab value="nodeHealth" label="Node Health">
          <div className={classes.tabContainer}>
            {clusterHeader}
            <NodeHealthWithTasksToggler />
          </div>
        </Tab>
        <Tab value="clusterDetails" label="Cluster Details">
          <div className={classes.tabContainer}>
            {clusterHeader}
            <ClusterInfo />
          </div>
        </Tab>
      </Tabs>
    </PageContainer>
  )
}

export default ClusterDetailsPage

const ClusterStatusAndUsage = ({ cluster, loading }) => {
  const { usage = emptyObj, name, links = emptyObj, cloudProviderType = '', version } = cluster
  const classes = useStyles()
  const clusterLinks = {
    grafana: usage.grafanaLink,
    ...links,
  }
  const deployment = cloudProviderTypes[cloudProviderType] || capitalizeString(cloudProviderType)
  return (
    <div className={classes.detailsHeader}>
      <HeaderCard
        title={name}
        subtitle={`${deployment} - ${version}`}
        icon="project-diagram"
        links={clusterLinks}
      >
        <ClusterConnectionStatus
          iconStatus
          className={classes.statusColor}
          variant="header"
          cluster={cluster}
          message={loading ? 'loading' : undefined}
        />
        <ClusterHealthStatus
          iconStatus
          className={classes.statusColor}
          variant="header"
          cluster={cluster}
          message={loading ? 'loading' : undefined}
        />
      </HeaderCard>
      <UsageWidget units="GHz" title="Compute" stats={usage.compute} />
      <UsageWidget units="GiB" title="Memory" stats={usage.memory} />
      <UsageWidget units="GiB" title="Storage" stats={usage.disk} />
    </div>
  )
}

const HeaderCard = ({ title, subtitle, icon, loading = false, links, children }) => {
  const hasLinks = !!links.grafana || !!links.dashboard || !!links.kubeconfig
  const classes = useStyles({ hasLinks })
  return (
    <Card className={classes.headerCardContainer} elevation={0}>
      <header className={classes.headerCardHeader}>
        <Tooltip title={title} interactive>
          <Text variant="subtitle1" component="h1">
            {title}
          </Text>
        </Tooltip>

        <FontAwesomeIcon className={clsx({ 'fa-spin': loading }, classes.headerIcon)}>
          {loading ? 'sync' : icon}
        </FontAwesomeIcon>
        <Text variant="body2" component="p">
          {subtitle}
        </Text>
      </header>
      <div className={classes.headerCardBody}>{children}</div>
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
            icon="lock"
            className={classes.verticalLink}
            cluster={links.kubeconfig.cluster}
          />
        )}
      </footer>
    </Card>
  )
}
