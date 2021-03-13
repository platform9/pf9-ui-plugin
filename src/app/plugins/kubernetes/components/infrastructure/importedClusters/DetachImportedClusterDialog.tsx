import React, { useCallback } from 'react'
import Text from 'core/elements/text'
import { Dialog, DialogContent, DialogActions, Button, DialogTitle } from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import TextField from 'core/components/validatedForm/TextField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { importedClusterActions } from './actions'
import { trackEvent } from 'utils/tracking'

interface IDetachImportedClusterDialog {
  rows: any[]
  onClose: () => void
}

const stopPropagation = (e) => e.stopPropagation()
const DetachImportedClusterDialog: React.FC<IDetachImportedClusterDialog> = ({
  rows: [cluster],
  onClose,
}) => {
  const [detachCluster, detachingCluster] = useDataUpdater(
    importedClusterActions.delete,
    (success) => {
      trackEvent('Detach Imported Cluster', {
        cluster_uuid: cluster.uuid,
        cluster_name: cluster.name,
        cloud_provider_type: cluster.providerType,
      })
      success && onClose()
    },
  )
  const title = `Detach cluster "${cluster?.name}"?`
  const handleDetach = useCallback(async () => {
    await detachCluster(cluster)
  }, [cluster])

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <DialogTitle>
        <Text variant="subtitle1">{title}</Text>
      </DialogTitle>
      <ValidatedForm initialValues={cluster} fullWidth onSubmit={handleDetach} elevated={false}>
        {({ values }) => (
          <Progress loading={detachingCluster} renderContentOnMount maxHeight={60}>
            <DialogContent>
              <Text variant="body1" component="div">
                Please type "<b>{cluster?.name}</b>" to confirm.
              </Text>
              <TextField id="clusterName" type="text" label="Cluster name" />
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" color="secondary" onClick={onClose}>
                Don't Detach
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={values?.clusterName !== cluster?.name}
              >
                Detach this cluster
              </Button>
            </DialogActions>
          </Progress>
        )}
      </ValidatedForm>
    </Dialog>
  )
}

export default DetachImportedClusterDialog
