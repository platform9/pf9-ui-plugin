import React, { useCallback } from 'react'
import { Dialog, DialogActions, makeStyles } from '@material-ui/core'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'
import Text from 'core/elements/text'
import { rbacProfileBindingsActions } from '../actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import Progress from 'core/components/progress/Progress'

const useStyles = makeStyles<Theme>((theme) => ({
  outlinedButton: {
    background: theme.palette.grey['000'],
    color: theme.palette.blue[500],
  },
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  dialogContent: {
    margin: theme.spacing(3, 2),
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  marginRight: {
    marginRight: theme.spacing(1),
  },
}))

interface Props {
  handleClose: any
  wizardContext: any
}

const SkipDryRunDialog = ({ handleClose, wizardContext }: Props) => {
  const classes = useStyles({})
  const { history } = useReactRouter()

  const onComplete = useCallback(
    (success) => {
      if (success) {
        history.push(routes.rbac.profiles.list.path())
        handleClose()
      }
    },
    [history],
  )

  const [updateProfileBindingAction, creating] = useDataUpdater(
    rbacProfileBindingsActions.create,
    onComplete,
  )

  const handleDeploy = useCallback(() => {
    updateProfileBindingAction(wizardContext)
  }, [wizardContext])

  return (
    <>
      <Dialog open fullWidth maxWidth="sm" onClose={handleClose}>
        <Progress loading={creating} overlay renderContentOnMount message="Processing...">
          <div className={classes.dialogContainer}>
            <Text variant="body1" className={classes.dialogHeader}>
              Skip Impact Analysis?
            </Text>
            <div className={classes.dialogContent}>
              <Text variant="body2">
                The Platform9 Profile Agent can analyze the chosen cluster to show the impact of the
                profile.
              </Text>
              <Text variant="body2">
                Do you want to continue and deploy the profile without the Impact Analysis?
              </Text>
            </div>
            <DialogActions>
              <Button color="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleDeploy}>
                Deploy
              </Button>
            </DialogActions>
          </div>
        </Progress>
      </Dialog>
    </>
  )
}

export default SkipDryRunDialog
