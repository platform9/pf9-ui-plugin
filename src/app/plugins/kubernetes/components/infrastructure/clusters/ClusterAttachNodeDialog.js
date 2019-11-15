import React, { PureComponent } from 'react'
import ExternalLink from 'core/components/ExternalLink'
import { compose, propOr } from 'ramda'
import { withAppContext } from 'core/providers/AppProvider'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableRow, TableCell,
  Typography,
} from '@material-ui/core'
import withDataLoader from 'core/hocs/withDataLoader'
import withDataMapper from 'core/hocs/withDataMapper'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = e => {
  // Except for <a href=""> style links
  if (e.target.tagName.toUpperCase() === 'A') { return }
  e.preventDefault()
  e.stopPropagation()
}

class ClusterAttachNodeDialog extends PureComponent {
  state = {}

  handleClose = () => {
    this.props.onClose && this.props.onClose()
  }

  handleSubmit = async () => {
    const { row, getContext, setContext } = this.props

    const nodes = Object.keys(this.state)
      .filter(uuid => this.state[uuid] !== 'unassigned')
      .map(uuid => ({ uuid, isMaster: this.state[uuid] === 'master' }))

    const clusterUuid = row.uuid
    await cloudProviderActions.attachNodesToCluster({
      getContext,
      setContext,
      params: { clusterUuid, nodes },
    })
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
    const { data: { nodes } } = this.props
    const freeNodes = nodes.filter(x => !x.clusterUuid)
    return (
      <Dialog open onClose={this.handleClose} onClick={stopPropagation}>
        <DialogTitle>Attach Node to Cluster</DialogTitle>
        <DialogContent>
          <p>
            <b>IMPORTANT</b>:
            Before adding nodes to a cluster, please ensure that you have followed the requirements
            in <ExternalLink url="https://docs.platform9.com/getting-started/managed-container-cloud-requirements-checklist/">this
            article</ExternalLink> for
            each node.
          </p>

          <p>
            Choose the nodes you would like to add to this cluster as well as their corresponding
            role.
          </p>
          {freeNodes.length === 0 &&
          <Typography variant="h5">No nodes available to attach</Typography>
          }
          <Table>
            <TableBody>
              {freeNodes.map(this.renderNodeRow)}
            </TableBody>
          </Table>
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
  withAppContext,
  withDataLoader({ nodes: loadNodes }),
  withDataMapper({ nodes: propOr([], 'nodes') }),
)(ClusterAttachNodeDialog)
