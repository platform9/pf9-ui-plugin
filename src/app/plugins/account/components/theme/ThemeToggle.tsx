import React, { useState } from 'react'
import { Dialog, DialogActions, FormControlLabel, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import Button from 'core/elements/button'

interface Props {
  themeIsEnabled: boolean
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

const ThemeToggle = ({ themeIsEnabled, checked, onClick }: Props) => {
  const classes = useStyles({})
  const [showModal, setModal] = useState(false)

  const handleOpen = () => setModal(true)
  const handleClose = () => setModal(false)

  const toggleSwitch = () => {
    if (checked && themeIsEnabled) {
      handleOpen()
      return
    }
    onClick()
  }

  const removeTheme = async () => {
    await onClick()
    handleClose()
  }

  const renderModalContent = () => (
    <Dialog open fullWidth maxWidth="sm" onClose={handleClose}>
      <div className={classes.dialogContainer}>
        <Text variant="body1" className={classes.dialogHeader}>
          Remove Custom Theme
        </Text>
        <div className={classes.dialogContent}>
          <Text variant="body2">Are you sure you would like to remove the custom theme?</Text>
        </div>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={removeTheme}>Remove</Button>
        </DialogActions>
      </div>
    </Dialog>
  )

  return (
    <div>
      {showModal && renderModalContent()}
      <FormControlLabel
        control={<Switch checked={checked} onClick={toggleSwitch} />}
        label="Enable Custom Theme"
        labelPlacement="end"
      />
    </div>
  )
}

export default ThemeToggle
