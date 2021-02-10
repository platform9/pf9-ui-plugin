import React from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { repositoryActions } from './actions'
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

const UpdateRepositoryDialog = ({ rows: [repository], onClose }) => {
  const anyRepositoryActions = repositoryActions as any
  const [update, updating] = useDataUpdater(anyRepositoryActions.updateRepositories, onClose)

  const updateRepository = () => update({ repositories: [repository] })

  return (
    <Dialog open onClose={onClose}>
      <Progress loading={updating} minHeight={100} maxHeight={100}>
        <DialogTitle>Update Repository</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will update repository {repository.name}. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={onClose} />
          <SubmitButton onClick={updateRepository} />
        </DialogActions>
      </Progress>
    </Dialog>
  )
}

export default UpdateRepositoryDialog
