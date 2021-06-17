import useDataUpdater from 'core/hooks/useDataUpdater'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import React from 'react'
import { deploymentActions } from './actions'
import Progress from 'core/components/progress/Progress'
import CancelButton from 'core/components/buttons/CancelButton'
import SubmitButton from 'core/components/buttons/SubmitButton'

const protectedNamespaces = [
  'platform9-system',
  'kube-system',
  'pf9-olm',
  'pf9-operators',
  'pf9-monitoring',
]

const DeleteDeploymentDialog = ({ rows: [deployment], onClose }) => {
  const { clusterId, namespace, name, id } = deployment
  const [deleteDeployment, deletingDeployment] = useDataUpdater(deploymentActions.delete, onClose)
  const allowDelete = !protectedNamespaces.includes(namespace)

  const handleSubmit = () => {
    deleteDeployment({ clusterId, namespace, name, id })
  }

  return (
    <Dialog open onClose={onClose}>
      <Progress loading={deletingDeployment} minHeight={100} maxHeight={100}>
        <DialogTitle>Delete Deployment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {allowDelete
              ? `Delete deployment: ${name}?`
              : 'Protected Namespace - Please contact Platform9 for assistance'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {allowDelete ? (
            <>
              <CancelButton onClick={onClose} />
              <SubmitButton onClick={handleSubmit} />
            </>
          ) : (
            <CancelButton onClick={onClose}>Close</CancelButton>
          )}
        </DialogActions>
      </Progress>
    </Dialog>
  )
}

export default DeleteDeploymentDialog
