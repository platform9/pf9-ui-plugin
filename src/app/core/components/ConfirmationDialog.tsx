import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import { withProgress } from 'core/components/progress/Progress'

interface IConfirmationDialog {
  open: boolean
  title?: string
  text?: JSX.Element
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
}

class ConfirmationDialog extends React.PureComponent<IConfirmationDialog> {
  handleCancel = () => {
    this.props.onCancel && this.props.onCancel()
  }

  handleConfirm = () => {
    this.props.onConfirm && this.props.onConfirm()
  }

  render () {
    const {
      open,
      title = 'Are you sure?',
      text = 'Are you sure?',
      cancelText = 'Cancel',
      confirmText = 'Confirm',
    } = this.props

    return (
      <Dialog
        open={open}
        onClose={this.handleCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel} color="primary">
            {cancelText}
          </Button>
          <Button onClick={this.handleConfirm} color="primary" autoFocus>
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withProgress(ConfirmationDialog, {
  renderContentOnMount: true,
  message: 'Please wait...'
}) as React.ComponentType<IConfirmationDialog>
