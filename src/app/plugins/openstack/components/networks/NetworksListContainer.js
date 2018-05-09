import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import ConfirmationDialog from 'core/common/ConfirmationDialog'
import NetworksList from './NetworksList'

import { removeNetwork } from '../../actions/networks'

const mapStateToProps = state => {
  const { networks } = state.openstack
  return {
    networks: networks.networks,
  }
}

@withRouter
@connect(mapStateToProps)
class NetworksListContainer extends React.Component {
  state = {
    showConfirmation: false,
    networksToDelete: null,
  }

  redirectToAdd = () => {
    this.props.history.push('/ui/openstack/networks/add')
  }

  handleDelete = selectedIds => {
    this.setState({ showConfirmation: true })
    const selectedNetworks = this.props.networks.filter(network => selectedIds.includes(network.id))
    this.setState({ networksToDelete: selectedNetworks })
  }

  handleDeleteCancel = () => {
    this.setState({ showConfirmation: false })
  }

  handleDeleteConfirm = () => {
    this.setState({ showConfirmation: false })
    const networks = this.state.networksToDelete || []
    networks.forEach(network => this.props.dispatch(removeNetwork(network.id)))
  }

  deleteConfirmText = () => {
    const { networksToDelete } = this.state
    if (!networksToDelete) {
      return
    }
    const networkNames = networksToDelete.map(x => x.name).join(', ')
    return `This will permanently delete the following network(s): ${networkNames}`
  }

  render () {
    const { networks } = this.props

    return (
      <div>
        <ConfirmationDialog
          open={this.state.showConfirmation}
          text={this.deleteConfirmText()}
          onCancel={this.handleDeleteCancel}
          onConfirm={this.handleDeleteConfirm}
        />

        <NetworksList
          networks={networks}
          onAdd={this.redirectToAdd}
          onDelete={this.handleDelete}
        />
      </div>
    )
  }
}

export default NetworksListContainer
