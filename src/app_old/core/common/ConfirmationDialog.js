import React from 'react'
import PropTypes from 'prop-types'
import Button from 'material-ui/Button'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog'

class ConfirmationDialog extends React.Component {
  handleCancel = () => {
    this.props.onCancel && this.props.onCancel()
  }

  handleConfirm = () => {
    this.props.onConfirm && this.props.onConfirm()
  }

  render () {
    const {
      open,
      title,
      text,
      cancelText,
      confirmText,
    } = this.props

    return (
      <Dialog
        open={open}
        onClose={this.handleClose}
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

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  text: PropTypes.string,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
}

ConfirmationDialog.defaultProps = {
  title: 'Are you sure?',
  text: 'Are you sure?',
  cancelText: 'Cancel',
  confirmText: 'Confirm',
}

export default ConfirmationDialog
