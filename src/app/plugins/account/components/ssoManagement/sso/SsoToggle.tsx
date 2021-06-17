import React, { useState } from 'react'
import { Dialog, DialogActions, FormControlLabel, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'

interface Props {
  ssoIsEnabled: boolean
  checked: boolean
  onClick?: any
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

const SsoToggle = ({ ssoIsEnabled, checked, onClick }: Props) => {
  const classes = useStyles({})
  const [showModal, setModal] = useState(false)

  const handleOpen = () => setModal(true)
  const handleClose = () => setModal(false)

  const toggleSwitch = () => {
    if (checked && ssoIsEnabled) {
      handleOpen()
      return
    }
    onClick()
  }

  const disableSso = async () => {
    await onClick()
    handleClose()
  }

  const renderModalContent = () => (
    <Dialog open fullWidth maxWidth="sm" onClose={handleClose}>
      <div className={classes.dialogContainer}>
        <Text variant="body1" className={classes.dialogHeader}>
          Disable SSO
        </Text>
        <div className={classes.dialogContent}>
          <Text variant="body2">Are you sure you would like to disable SSO?</Text>
        </div>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={disableSso}>Disable</Button>
        </DialogActions>
      </div>
    </Dialog>
  )

  return (
    <div>
      {showModal && renderModalContent()}
      <FormControlLabel
        control={<Switch checked={checked} onClick={toggleSwitch} />}
        label="Enable SSO"
        labelPlacement="end"
      />
    </div>
  )
}

export default SsoToggle
