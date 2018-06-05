import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import ConfirmationDialog from './ConfirmationDialog'

@withRouter
class CRUDListContainer extends React.Component {
  state = {
    showConfirmation: false,
    selectedItems: null,
  }

  deleteConfirmText = () => {
    const { selectedItems } = this.state
    if (!selectedItems) {
      return
    }
    const selectedNames = selectedItems.map(x => x.name).join(', ')
    return `This will permanently delete the following: ${selectedNames}`
  }

  handleDelete = selectedIds => {
    this.setState({ showConfirmation: true })
    const selectedItems = this.props.items.filter(item => selectedIds.includes(item.id))
    this.setState({ selectedItems })
    return new Promise(resolve => { this.resolveDelete = resolve })
  }

  handleDeleteCancel = () => {
    this.setState({ showConfirmation: false })
  }

  handleDeleteConfirm = () => {
    this.setState({ showConfirmation: false })
    const items = this.state.selectedItems || []
    items.forEach(item => this.props.onRemove(item.id))
    this.setState({ selectedItems: [] })
    this.resolveDelete()
  }

  redirectToAdd = () => {
    if (this.props.addUrl) {
      this.props.history.push(this.props.addUrl)
    }
  }

  render () {
    return (
      <div>
        <ConfirmationDialog
          open={this.state.showConfirmation}
          text={this.deleteConfirmText()}
          onCancel={this.handleDeleteCancel}
          onConfirm={this.handleDeleteConfirm}
        />
        {this.props.children({
          onDelete: this.handleDelete,
          onAdd: this.redirectToAdd
        })}
      </div>
    )
  }
}

CRUDListContainer.propTypes = {
  onRemove: PropTypes.func,
  addUrl: PropTypes.string,
}

export default CRUDListContainer
