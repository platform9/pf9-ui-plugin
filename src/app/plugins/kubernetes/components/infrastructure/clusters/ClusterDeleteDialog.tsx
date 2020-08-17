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
import { CloudProviders } from '../cloudProviders/model'
import { trackEvent } from 'utils/tracking'

interface IClusterDeleteDialog {
  rows: ICluster[]
  onClose: () => void
}

const stopPropagation = (e) => e.stopPropagation()
const ClusterDeleteDialog: React.FC<IClusterDeleteDialog> = ({ rows: [cluster], onClose }) => {
  const [showDeauthNodeDialog, setShowDeauthNodeDialog] = useState(false)
  const [deleteCluster, deletingCluster] = useDataUpdater(clusterActions.delete, (success) => {
    trackEvent('Delete Cluster', {
      cluster_uuid: cluster.uuid,
      cluster_name: cluster.name,
      cluster_nodes: cluster.nodes.length,
      cloud_provider_type: cluster.cloudProviderType,
    })
    // TODO: If deauth node feature is supported after cluster delete then enable this feature
    // eslint-disable-next-line no-constant-condition
    false && success && cluster?.nodes?.length > 0 ? setShowDeauthNodeDialog(true) : onClose()
  })
  const title = `Permanently delete cluster "${cluster?.name}"?`
  const handleDelete = useCallback(
    (e) => {
      e && e.preventDefault()
      deleteCluster(cluster)
    },
    [cluster],
  )

  if (showDeauthNodeDialog) return <DeauthNodeDialog nodeList={cluster.nodes} onClose={onClose} />

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <DialogTitle>
        <Typography variant="subtitle1">{title}</Typography>
      </DialogTitle>
      <ValidatedForm initialValues={cluster} fullWidth onSubmit={handleDelete} elevated={false}>
        {({ values }) => (
          <Progress loading={deletingCluster} renderContentOnMount maxHeight={60}>
            <DialogContent>
              <Typography variant="body1" component="div">
                Please type "<b>{cluster?.name}</b>" to confirm.
              </Typography>
              <TextField id="clusterName" type="text" label="Cluster name" />
              {cluster.cloudProviderType === CloudProviders.BareOS && (
                <Alert
                  small
                  variant="warning"
                  message="When deleting a BareOS cluster all nodes will remain connected to Platform9"
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" color="secondary" onClick={onClose}>
                Don't Delete
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={values?.clusterName !== cluster?.name}
                onClick={handleDelete}
              >
                Delete this cluster
              </Button>
            </DialogActions>
          </Progress>
        )}
      </ValidatedForm>
    </Dialog>
  )
}

export default ClusterDeleteDialog
