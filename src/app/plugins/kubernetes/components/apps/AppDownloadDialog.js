import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button,
} from '@material-ui/core'
import useDataLoader from 'core/hooks/useDataLoader'
import Progress from 'core/components/progress/Progress'
import { appVersionLoader } from 'k8s/components/apps/actions'
import SimpleLink from 'core/components/SimpleLink'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    minWidth: 300,
    maxHeight: 500,
  },
}))

export default ({ onClose, app }) => {
  const classes = useStyles()
  const { clusterId, id } = app
  const [release, appId] = id.split('/')
  const [appVersions, loadingVersions] = useDataLoader(appVersionLoader, {
    clusterId,
    appId,
    release,
  })

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Download {app.name}</DialogTitle>
      <Progress message="Loading versions..." loading={loadingVersions} inline>
        <DialogContent className={classes.root}>
          {appVersions.length === 0 &&
          <Typography variant="h5">No versions available to download</Typography>}
          <ul>
            {appVersions.map(({ version, appVersion, downloadLink }) => <li key={version}>
              <SimpleLink src={downloadLink}>
                <strong>{version}</strong>&nbsp;
                (App v{appVersion})
              </SimpleLink>
            </li>)}
          </ul>
        </DialogContent>
      </Progress>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
