import React, { useCallback, useState } from 'react'
import {
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  DialogTitle,
} from '@material-ui/core'

import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import Progress from 'core/components/progress/Progress'
import TextField from 'core/components/validatedForm/TextField'
import useDataUpdater from 'core/hooks/useDataUpdater'
import DeauthNodeDialog from '../nodes/DeauthNodeDialog'
import { ICluster } from './model'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Alert from 'core/components/Alert'

interface IClusterDeleteDialog {
  rows: ICluster[]
  onClose: () => void
}

const stopPropagation = (e) => e.stopPropagation()
const ClusterDeleteDialog: React.FC<IClusterDeleteDialog> = ({ rows: [cluster], onClose }) => {
  const [showDeauthNodeDialog, setShowDeauthNodeDialog] = useState(false)
  const [deleteCluster, deletingCluster] = useDataUpdater(clusterActions.delete, (success) =>
    // TODO: If deauth node feature is supported after cluster delete then enable this feature
    // eslint-disable-next-line no-constant-condition
    false && success && cluster?.nodes?.length > 0 ? setShowDeauthNodeDialog(true) : onClose(),
  )
  const title = `Confirm delete cluster "${cluster?.name}"?`
  const handleDelete = useCallback(async () => {
    await deleteCluster(cluster)
  }, [cluster])

  if (showDeauthNodeDialog) return <DeauthNodeDialog nodeList={cluster.nodes} onClose={onClose} />

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <DialogTitle>{title}</DialogTitle>
      <ValidatedForm initialValues={cluster} fullWidth onSubmit={handleDelete}>
        {({ values }) => (
          <Progress loading={deletingCluster} renderContentOnMount maxHeight={60}>
            <DialogContent>
              <Typography variant="body1" component="div">
                This will permanently delete the cluster
              </Typography>
              <Alert
                variant="warning"
                message="When deleting a cluster all nodes will remain connected to Platform9"
              />
              <TextField id="clusterName" type="text" label="Cluster name" />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={values?.clusterName !== cluster?.name}
                onClick={handleDelete}
              >
                Confirm
              </Button>
            </DialogActions>
          </Progress>
        )}
      </ValidatedForm>
    </Dialog>
  )
}

export default ClusterDeleteDialog
