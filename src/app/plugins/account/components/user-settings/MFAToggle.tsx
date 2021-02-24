import React, { useState } from 'react'
import { Dialog, DialogActions, FormControlLabel, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'

interface Props {
  mfaIsEnabled: boolean
  checked: boolean
  onClick?: any
  className?: string
}

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

const MFAToggle = ({ mfaIsEnabled, checked, onClick, className = '' }: Props) => {
  const classes = useStyles({})
  const [showModal, setModal] = useState(false)

  const handleOpen = () => setModal(true)
  const handleClose = () => setModal(false)

  const toggleSwitch = () => {
    if (checked && mfaIsEnabled) {
      handleOpen()
      return
    }
    onClick()
  }

  const disableMFA = async () => {
    await onClick()
    handleClose()
  }

  const renderModalContent = () => (
    <Dialog open fullWidth maxWidth="sm" onClose={handleClose}>
      <div className={classes.dialogContainer}>
        <Text variant="body1" className={classes.dialogHeader}>
          Disable MFA
        </Text>
        <div className={classes.dialogContent}>
          <Text variant="body2">Are you sure you would like to disable MFA?</Text>
          <Text variant="body2">
            To enable MFA in the future, it will require setting up the MFA again.
          </Text>
        </div>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={disableMFA}>Disable</Button>
        </DialogActions>
      </div>
    </Dialog>
  )

  return (
    <div className={className}>
      {showModal && renderModalContent()}
      <FormControlLabel
        control={<Switch checked={checked} onClick={toggleSwitch} color="primary" />}
        label="Enable Multifactor Authentication"
        labelPlacement="end"
      />
    </div>
  )
}

export default MFAToggle
