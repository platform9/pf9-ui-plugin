import React from 'react'
import { Dialog, DialogActions } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'

const useStyles = makeStyles((theme: Theme) => ({
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  dialogContent: {
    margin: theme.spacing(3, 2),
  },
}))

interface Props {
  onClose: () => void
}

const SsoEnabledDialog = ({ onClose }: Props) => {
  const classes = useStyles({})

  return (
    <Dialog open onClose={onClose}>
      <div className={classes.dialogContainer}>
        <div className={classes.dialogContent}>
          <Text variant="body2">SSO configuration saved successfully.</Text>
        </div>
        <DialogActions>
          <Button onClick={onClose}>OK</Button>
        </DialogActions>
      </div>
    </Dialog>
  )
}

export default SsoEnabledDialog
