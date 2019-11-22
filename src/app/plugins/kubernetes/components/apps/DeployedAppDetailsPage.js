import React, { useState, useCallback } from 'react'
import useReactRouter from 'use-react-router'
import Progress from 'core/components/progress/Progress'
import { Paper, Grid, Typography, CardMedia, Button, Card } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { deploymentDetailLoader, releaseActions } from 'k8s/components/apps/actions'
import { emptyObj } from 'utils/fp'
import SimpleLink from 'core/components/SimpleLink'
import PageContainer from 'core/components/pageContainer/PageContainer'
import ConfirmationDialog from 'core/components/ConfirmationDialog'

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
  text: {
    fontFamily: 'monospace, serif',
    border: '1px solid #ccc',
    padding: 11,
    overflowX: 'scroll',
    color: '#212121',
  },
}))

const backUrl = '/ui/kubernetes/apps#deployedApps'

const DeployedAppDetailsPage = () => {
  const classes = useStyles()
  const { match: { params } } = useReactRouter()
  const [showingDeleteDialog, setShowingDeleteDialog] = useState(false)
  // We are just interested in the first (and only) item
  const [[release = emptyObj], loading] = useDataLoader(deploymentDetailLoader, params)
  const [remove, removing] = useDataUpdater(releaseActions.delete, success => {
    if (success) {
      history.push(backUrl)
    }
  })
  const handleDelete = useCallback(async () => {
    remove(release)
  }, [release])

  return <PageContainer header={
    <SimpleLink src={backUrl} className={classes.backLink}>
      « Back to Deployed Applications
    </SimpleLink>}>
    <ConfirmationDialog
      open={showingDeleteDialog}
      title="Delete Application"
      text={<>
        You are about to delete the application <strong>{release.name}</strong>.<br /><br />
        This operation cannot be undone. Are you sure?
      </>}
      onCancel={() => setShowingDeleteDialog(false)}
      onConfirm={handleDelete}
    />
    <Progress loading={loading || removing} overlay renderContentOnMount>
      <Grid container justify="center" spacing={3}>
        <Grid item xs={3} lg={2}>
          {release.logoUrl && <Card className={classes.card}>
            <CardMedia className={classes.icon} image={release.logoUrl} title={release.name} />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowingDeleteDialog(true)}
            >
              Delete
            </Button>
          </Card>}
          <Paper className={classes.paper}>
            <Typography
              variant="subtitle2">
              Application
            </Typography>
            <Typography variant="body2" component="div">
              {release.chartName} {release.version}
            </Typography>
            <br />
            <Typography
              variant="subtitle2">
              Namespace
            </Typography>
            <Typography variant="body2" component="div">
              {release.namespace}
            </Typography>
            <br />
            <Typography
              variant="subtitle2">
              Status
            </Typography>
            <Typography variant="body2" component="div">
              {release.status}
            </Typography>
            <br />
            <Typography
              variant="subtitle2">
              Last Updated
            </Typography>
            <Typography variant="body2" component="div">
              {release.lastUpdated}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={9} lg={10} zeroMinWidth>
          <Typography variant="h4" component="h4">
            {release.name}
          </Typography>
          <br />
          <Typography variant="subtitle1">Resources</Typography>
          <Typography variant="body1" component="pre" className={classes.text}>{release.resourcesText || ''}</Typography>
          <br />
          <Typography variant="subtitle1">Notes</Typography>
          <Typography variant="body1" component="pre" className={classes.text}>{release.notesText || ''}</Typography>
        </Grid>
      </Grid>
    </Progress>
  </PageContainer>
}

export default DeployedAppDetailsPage
