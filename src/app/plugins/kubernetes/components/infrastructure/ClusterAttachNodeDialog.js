import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core'

class ClusterAttachNodeDialog extends React.Component {
  handleClose = () => {
    this.props.onClose && this.props.onClose()
  }

  handleSubmit = () => {
    console.log('submitting')
    this.handleClose()
  }

  render () {
    return (
      <Dialog
        open
        onClose={this.handleClose}
      >
        <DialogTitle>Attach Node to Cluster</DialogTitle>
        <DialogContent>
          <DialogContentText>testing</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} color="primary" autoFocus>
            Attach
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default ClusterAttachNodeDialog
