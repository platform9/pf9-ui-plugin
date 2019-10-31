import React, { useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, Button, DialogActions } from '@material-ui/core'
import useReactRouter from 'use-react-router'
import Progress from 'core/components/progress/Progress'
import { appActions } from 'k8s/components/apps/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import AppVersionPicklist from 'k8s/components/apps/AppVersionPicklist'

export default ({ onClose, app }) => {
  const { history } = useReactRouter()
  const { clusterId, id: chartId, name } = app
  const [release, appId] = chartId.split('/')
  const [deployApp, deployingApp] = useDataUpdater(appActions.deploy, success => {
    onClose()
    if (success) {
      // After deploying, redirect to deployed apps list
      history.push('/ui/kubernetes/apps#deployedApps')
    }
  })
  const handleSubmit = useCallback(async values => {
    deployApp({ chartId, clusterId, ...values })
  }, [chartId])

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Deploy {name}</DialogTitle>
      <ValidatedForm onSubmit={handleSubmit}>
        <Progress loading={deployingApp} renderContentOnMount inline>
          <DialogContent>
            <TextField id="releaseName" label="Application Name" />
            <PicklistField
              DropdownComponent={NamespacePicklist}
              id="namespace"
              label="Namespace"
              clusterId={clusterId}
              required
            />
            <PicklistField
              DropdownComponent={AppVersionPicklist}
              disabled={!clusterId}
              id="chartVersion"
              label="App Version"
              clusterId={clusterId}
              release={release}
              appId={appId}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Deploy
            </Button>
          </DialogActions>
        </Progress>
      </ValidatedForm>
    </Dialog>
  )
}
