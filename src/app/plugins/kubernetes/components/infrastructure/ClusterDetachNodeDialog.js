import React from 'react'
import { compose, propOr } from 'ramda'
import { withAppContext } from 'core/AppProvider'
import { detachNodesFromCluster } from './actions'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableRow, TableCell,
  Typography,
} from '@material-ui/core'
import { loadNodes } from 'k8s/components/infrastructure/actions'
import withDataLoader from 'core/hocs/withDataLoader'
import withDataMapper from 'core/hocs/withDataMapper'

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = e => {
  // Except for <a href=""> style links
  if (e.target.tagName.toUpperCase() === 'A') { return }
  e.preventDefault()
  e.stopPropagation()
}

class ClusterDetachNodeDialog extends React.Component {
  state = {}

  handleClose = () => {
    this.props.onClose && this.props.onClose()
  }

  handleSubmit = async () => {
    const { row, getContext, setContext } = this.props

    const nodeUuids = Object.keys(this.state)
      .filter(uuid => this.state[uuid] === 'detach')

    const clusterUuid = row.uuid
    await detachNodesFromCluster({ getContext, setContext, params: { clusterUuid, nodeUuids } })
    this.handleClose()
  }

  setNodeRole = uuid => (e, value) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ [uuid]: value || 'attached' })
  }

  renderNodeRow = node => {
    const uuid = node.uuid
    const value = this.state[uuid] || 'attached'
    return (
      <TableRow key={uuid}>
        <TableCell>{node.name}</TableCell>
        <TableCell>
          <ToggleButtonGroup exclusive value={value} onChange={this.setNodeRole(uuid)}>
            <ToggleButton value="detach">Detach</ToggleButton>
            <ToggleButton value="attached">Attached</ToggleButton>
          </ToggleButtonGroup>
        </TableCell>
      </TableRow>
    )
  }

  render () {
    const { data, row } = this.props
    const { name } = row
    const attachedNodes = data.nodes.filter(node => node.clusterUuid === row.uuid)
    return (
      <Dialog open onClose={this.handleClose} onClick={stopPropagation}>
        <DialogTitle>Detach node from cluster ({name})</DialogTitle>
        <DialogContent>
          <p>Detaching a node from a Kubernetes cluster has the following impact:</p>
          <ul>
            <li>
              All containers running on the node will be destroyed.
            </li>
            <li>
              Deployment will be automatically restarted by Kubernetes on another node
              in the cluster provided sufficient resources are available.
            </li>
            <li>
              This does not uninstall any Kubernetes packages from the node.
              Hence the node is available for reattaching to the same or different cluster.
            </li>
          </ul>

          <p>Choose nodes to detach from the cluster</p>

          {attachedNodes.length === 0 &&
            <Typography variant="h5">No nodes available to detach</Typography>
          }
          <Table>
            <TableBody>
              {attachedNodes.map(this.renderNodeRow)}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} color="primary" autoFocus>
            Detach nodes
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default compose(
  withAppContext,
  withDataLoader({ nodes: loadNodes }),
  withDataMapper({ nodes: propOr([], 'nodes') }),
)(ClusterDetachNodeDialog)
