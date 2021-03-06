import React from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { deployedAppActions } from './actions'
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

const DeleteAppDeploymentDialog = ({ name, chart, clusterId, namespace, onClose }) => {
  const classes = useStyles()
  const [deleteAppDeployment, deletingAppDeployment] = useDataUpdater(
    deployedAppActions.delete,
    onClose,
  )

  const handleAppDeploymentDeletion = () => deleteAppDeployment({ clusterId, namespace, name })

  return (
    <Dialog open onClose={onClose}>
      <FormFieldCard title="Delete App Deployment">
        <Progress loading={deletingAppDeployment} minHeight={100} maxHeight={100}>
          <div className={classes.dialogTextContent}>
            <Text variant="body2" component="p">
              Are you sure you would like to delete the App Deployment:
            </Text>
            <br />
            <Text variant="subtitle2">{name}</Text>
            <Text variant="body2">{chart}</Text>
            <br />
            <Text variant="body2">
              Once deleted it will be removed from all clusters it is currently deployed.
            </Text>
            <DialogActions className={classes.dialogButtons}>
              <Button className={classes.cancelButton} onClick={onClose}>
                Cancel
              </Button>
              <Button variant="light" color="primary" onClick={handleAppDeploymentDeletion}>
                Delete
              </Button>
            </DialogActions>
          </div>
        </Progress>
      </FormFieldCard>
    </Dialog>
  )
}

export default DeleteAppDeploymentDialog
