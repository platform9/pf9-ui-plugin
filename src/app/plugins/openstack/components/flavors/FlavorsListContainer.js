import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import ConfirmationDialog from 'core/common/ConfirmationDialog'
import FlavorsList from './FlavorsList'

import { removeFlavor } from '../../actions/flavors'

const mapStateToProps = state => {
  const { flavors } = state.openstack
  return {
    flavors: flavors.flavors,
  }
}

@withRouter
@connect(mapStateToProps)
class FlavorsListContainer extends React.Component {
  state = {
    showConfirmation: false,
    flavorsToDelete: null,
  }

  redirectToAdd = () => {
    this.props.history.push('/flavors/add')
  }

  handleDelete = selectedIds => {
    this.setState({ showConfirmation: true })
    const selectedFlavors = this.props.flavors.filter(flavor => selectedIds.includes(flavor.id))
    this.setState({ flavorsToDelete: selectedFlavors })
  }

  handleDeleteCancel = () => {
    this.setState({ showConfirmation: false })
  }

  handleDeleteConfirm = () => {
    this.setState({ showConfirmation: false })
    const flavors = this.state.flavorsToDelete || []
    flavors.forEach(flavor => this.props.dispatch(removeFlavor(flavor.id)))
  }

  deleteConfirmText = () => {
    const { flavorsToDelete } = this.state
    if (!flavorsToDelete) {
      return
    }
    const flavorNames = flavorsToDelete.map(x => x.name).join(', ')
    return `This will permanently delete the following flavor(s): ${flaorNames}`
  }

  render () {
    const { flavors } = this.props

    return (
      <FlavorsList flavors={flavors} onAdd={this.redirectToAdd} onDelete={this.handleDelete} />
    )
  }
}

export default FlavorsListContainer
