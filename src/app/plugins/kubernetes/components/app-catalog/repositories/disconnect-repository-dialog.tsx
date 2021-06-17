import React from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { repositoryActions } from './actions'
import { Dialog, DialogActions } from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'

const useStyles = makeStyles((theme: Theme) => ({
  dialogTextContent: {
    padding: theme.spacing(1, 2, 2, 2),
  },
  dialogButtons: {
    justifyContent: 'flex-start',
    padding: theme.spacing(0),
    marginTop: theme.spacing(4),
  },
  cancelButton: {
    background: theme.palette.grey['000'],
    border: `1px solid ${theme.palette.blue[500]}`,
    color: theme.palette.blue[500],
  },
}))

interface DisconnectRepositoryDialog {
  name: string
  clusterId: string
  onClose: () => void
  onSubmit?: () => void
}

const DisconnectRepositoryDialog = ({ name, clusterId, onClose, onSubmit }) => {
  const classes = useStyles()
  const anyRepositoryActions = repositoryActions as any
  const [disconnectRepository, disconnectingRepository] = useDataUpdater(
    anyRepositoryActions.deleteClustersFromRepository,
    onSubmit ? onSubmit : onClose,
  )

  const handleRepositoryDeletion = () =>
    disconnectRepository({ repoName: name, clusterIds: [clusterId] })

  return (
    <Dialog open onClose={onClose}>
      <FormFieldCard title="Disconnect Repository">
        <Progress loading={disconnectingRepository} minHeight={100} maxHeight={100}>
          <div className={classes.dialogTextContent}>
            <Text variant="body2" component="p">
              Are you sure you would like to disconnect the repository:
            </Text>
            <br />
            <Text variant="subtitle2">{name}</Text>
            <br />
            <Text variant="body2">
              Once disconnected, all apps that reside in this repository will no longer be available
              to this cluster.
            </Text>
            <DialogActions className={classes.dialogButtons}>
              <Button className={classes.cancelButton} onClick={onClose}>
                Cancel
              </Button>
              <Button variant="light" color="primary" onClick={handleRepositoryDeletion}>
                Disconnect
              </Button>
            </DialogActions>
          </div>
        </Progress>
      </FormFieldCard>
    </Dialog>
  )
}

export default DisconnectRepositoryDialog
