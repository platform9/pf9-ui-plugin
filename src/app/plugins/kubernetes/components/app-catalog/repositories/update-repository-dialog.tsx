import React from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { repositoryActions } from './actions'
import { Dialog, DialogActions } from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
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

const UpdateRepositoryDialog = ({ rows: [repository], onClose }) => {
  const classes = useStyles()
  const anyRepositoryActions = repositoryActions as any
  const [update, updating] = useDataUpdater(anyRepositoryActions.updateRepositories, onClose)

  const updateRepository = () => update({ repositories: [repository] })

  return (
    <Dialog open onClose={onClose}>
      <FormFieldCard title="Update Repository">
        <Progress loading={updating} minHeight={100} maxHeight={100}>
          <div className={classes.dialogTextContent}>
            <Text variant="body2" component="p">
              This will update repository <b>{repository.name}</b>. Are you sure?
            </Text>
            <DialogActions className={classes.dialogButtons}>
              <Button className={classes.cancelButton} onClick={onClose}>
                Cancel
              </Button>
              <Button variant="light" color="primary" onClick={updateRepository}>
                Update
              </Button>
            </DialogActions>
          </div>
        </Progress>
      </FormFieldCard>
    </Dialog>
  )
}

export default UpdateRepositoryDialog
