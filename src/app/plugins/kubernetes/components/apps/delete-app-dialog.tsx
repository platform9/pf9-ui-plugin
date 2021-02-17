import React, { useCallback } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import SubmitButton from 'core/components/buttons/SubmitButton'
import CancelButton from 'core/components/buttons/CancelButton'

const DeleteAppDialog = ({ rows: [app], onClose }) => {
  const handleSubmit = useCallback(() => {}, [])

  return (
    <Dialog open onClose={onClose}>
      <Progress loading={false} minHeight={100} maxHeight={100}>
        <DialogTitle>Delete App Deployment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete app deployment:
            <b>{app.name}</b>
            {app.name}
            Once deleted it will be removed from all clusters it is currently deployed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={onClose} />
          <SubmitButton onClick={handleSubmit}>Delete</SubmitButton>
        </DialogActions>
      </Progress>
    </Dialog>
  )
}

export default DeleteAppDialog
