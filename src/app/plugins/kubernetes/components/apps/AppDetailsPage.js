import React from 'react'
import Markdown from 'core/components/Markdown'
import useReactRouter from 'use-react-router'
import Progress from 'core/components/progress/Progress'
import { Paper, Grid, Typography } from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import AppVersionPicklist from 'k8s/components/apps/AppVersionPicklist'
import useParams from 'core/hooks/useParams'
import { singleAppLoader } from 'k8s/components/apps/actions'

const AppDetailsPage = () => {
  const { match: { params: routeParams } } = useReactRouter()
  const [params, getParamsUpdater] = useParams({
    clusterId: routeParams.clusterId,
    appId: routeParams.appId,
    release: routeParams.release,
  })
  const [app, loadingApp] = useDataLoader(singleAppLoader, params)

  return <Progress loading={loadingApp} overlay>
    <Grid container justify="center">
      <Grid item xs={3}>
        <Paper>
          <Typography
            variant="caption">
            Application Version
          </Typography>
          {params.version}
          <Typography
            variant="caption">
            Home
          </Typography>
          {app.version}
          <Typography
            variant="caption">
            Source Repository
          </Typography>
          {app.version}
          <Typography
            variant="caption">
            Maintainers
          </Typography>
          {app.version}
        </Paper>
      </Grid>
      <Grid item xs={9} zeroMinWidth>
        <AppVersionPicklist
          appId={params.appId}
          clusterId={params.clusterId}
          onChange={getParamsUpdater('version')} />
        <Markdown>{app.readmeMarkdown}</Markdown>
      </Grid>
    </Grid>
  </Progress>
}

export default AppDetailsPage
