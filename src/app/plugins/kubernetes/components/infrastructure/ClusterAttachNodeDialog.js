import React from 'react'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'
import { loadInfrastructure } from './actions'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core'

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = e => {
  e.preventDefault()
  e.stopPropagation()
}

class ClusterAttachNodeDialog extends React.Component {
  state = {}

  handleClose = () => {
    this.props.onClose && this.props.onClose()
  }

  handleSubmit = () => {
    const nodes = Object.keys(this.state)
      .filter(uuid => this.state[uuid] !== 'unassigned')
      .map(uuid => ({ uuid, isMaster: this.state[uuid] === 'master' }))
    const clusterUuid = this.props.row.uuid
    if (nodes.length > 0) {
      this.props.context.apiClient.qbert.attach(clusterUuid, nodes)
    }
    this.handleClose()
  }

  setNodeRole = uuid => (e, value) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ [uuid]: value || 'unassigned' })
  }

  renderNodeRow = node => {
    const uuid = node.uuid
    const value = this.state[uuid] || 'unassigned'
    return (
      <TableRow key={uuid}>
        <TableCell>{node.name}</TableCell>
        <TableCell>
          <ToggleButtonGroup exclusive value={value} onChange={this.setNodeRole(uuid)}>
            <ToggleButton value="unassigned">Unassigned</ToggleButton>
            <ToggleButton value="master">Master</ToggleButton>
            <ToggleButton value="worker">Worker</ToggleButton>
          </ToggleButtonGroup>
        </TableCell>
      </TableRow>
    )
  }

  render () {
    const { data } = this.props
    const freeNodes = data.filter(x => !x.clusterUuid)
    return (
      <Dialog open onClose={this.handleClose} onClick={stopPropagation}>
        <DialogTitle>Attach Node to Cluster</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {freeNodes.map(this.renderNodeRow)}
            </TableBody>
          </Table>
          <pre>{JSON.stringify(this.state, null, 4)}</pre>
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

export default compose(
  withDataLoader({ dataKey: 'nodes', loaderFn: loadInfrastructure }),
  withAppContext,
)(ClusterAttachNodeDialog)
