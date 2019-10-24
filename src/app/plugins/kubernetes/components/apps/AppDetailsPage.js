import React, { useState } from 'react'
import Markdown from 'core/components/Markdown'
import useReactRouter from 'use-react-router'
import Progress from 'core/components/progress/Progress'
import { Paper, Grid, Typography, CardMedia, Button, Card } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import AppVersionPicklist from 'k8s/components/apps/AppVersionPicklist'
import useParams from 'core/hooks/useParams'
import { appDetailLoader } from 'k8s/components/apps/actions'
import { emptyObj, emptyArr } from 'utils/fp'
import SimpleLink from 'core/components/SimpleLink'
import AppDeployDialog from 'k8s/components/apps/AppDeployDialog'
import PageContainer from 'core/components/pageContainer/PageContainer'

const useStyles = makeStyles(theme => ({
  backLink: {
    marginBottom: theme.spacing(2),
    alignSelf: 'flex-end',
  },
  card: {
    display: 'flex',
    flexFlow: 'column nowrap',
    padding: theme.spacing(1, 1, 3, 1),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    overflowWrap: 'break-word',
  },
  paper: {
    padding: theme.spacing(1, 1, 3, 1),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    overflowWrap: 'break-word',
    backgroundColor: '#e2f4ff'
  },
  icon: {
    width: '100%',
    minHeight: 120,
    backgroundSize: 'contain',
    backgroundPosition: '50%',
    marginBottom: theme.spacing(1),
  },
}))

const AppDetailsPage = () => {
  const classes = useStyles()
  const { match: { params: routeParams } } = useReactRouter()
  const { params, getParamsUpdater } = useParams({
    clusterId: routeParams.clusterId,
    appId: routeParams.id,
    release: routeParams.release,
  })
  const [showingDeployDialog, setShowingDeployDialog] = useState(false)
  // We are just interested in the first (and only) item
  const [[app = emptyObj], loadingApp] = useDataLoader(appDetailLoader, params)

  return <PageContainer header={
    <SimpleLink src={`/ui/kubernetes/apps`} className={classes.backLink}>
      « Back to Application Catalog
    </SimpleLink>}>
    {showingDeployDialog &&
    <AppDeployDialog
      app={app}
      onClose={() => setShowingDeployDialog(false)} />}
    <Progress loading={loadingApp} overlay renderContentOnMount>
      <Grid container justify="center" spacing={3}>
        <Grid item xs={3}>
          {app.logoUrl && <Card className={classes.card}>
            <CardMedia className={classes.icon} image={app.logoUrl} title={app.name} />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowingDeployDialog(true)}
            >
              Deploy
            </Button>
          </Card>}
          <Paper className={classes.paper}>
            <Typography
              variant="subtitle2">
              Application Version
            </Typography>
            <Typography variant="body2" component="div">
              {params.version}
            </Typography>
            <br />
            <Typography
              variant="subtitle2">
              Home
            </Typography>
            <Typography variant="body2" component="div">
              {app.home && <SimpleLink target="_blank" src={app.home} />}
            </Typography>
            <br />
            <Typography
              variant="subtitle2">
              Source Repository
            </Typography>
            <Typography variant="body2" component="div">
              {(app.sources || emptyArr).map(source =>
                <div key={source}>
                  <SimpleLink target="_blank" src={source} />
                </div>)}
            </Typography>
            <br />
            <Typography
              variant="subtitle2">
              Maintainers
            </Typography>
            <Typography variant="body2" component="div">
              {(app.maintainers || emptyArr).map(maintainer =>
                <div key={maintainer.email}>
                  <SimpleLink target="_blank" src={`mailto: ${maintainer.email}`}>{maintainer.name}</SimpleLink>
                </div>)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={9} zeroMinWidth>
          <AppVersionPicklist
            label="Application Version"
            appId={params.appId}
            clusterId={params.clusterId}
            release={params.release}
            value={params.version}
            onChange={getParamsUpdater('version')} />
          <br />
          <Markdown>{app.readmeMarkdown || ''}</Markdown>
        </Grid>
      </Grid>
    </Progress>
  </PageContainer>
}

export default AppDetailsPage
