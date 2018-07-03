import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { compose, withApollo } from 'react-apollo'
import ConfirmationDialog from './ConfirmationDialog'

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
    const { client, objType, removeQuery, getQuery } = this.props
    this.setState({ showConfirmation: false })
    const items = this.state.selectedItems || []
    items.forEach(item => this.handleRemove(client, item.id, objType, removeQuery, getQuery))
    this.setState({ selectedItems: [] })
    this.resolveDelete()
  }

  handleRemove = async (client, id, objType, removeQuery, getQuery) => {
    client.mutate({
      mutation: removeQuery,
      variables: { id },
      update: cache => {
        const data = cache.readQuery({ query: getQuery })
        data[objType] = data[objType].filter(x => x.id !== id)
        cache.writeQuery({ query: getQuery, data })
      }
    })
  }

  redirectToAdd = () => {
    if (this.props.addUrl) {
      this.props.history.push(this.props.addUrl)
    }
  }

  redirectToEdit = (selectedIds) => {
    if (this.props.editUrl) {
      const selectedId = selectedIds[0]
      this.props.history.push(`${this.props.editUrl}/${selectedId}`)
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
          onAdd: this.redirectToAdd,
          onEdit: this.redirectToEdit
        })}
      </div>
    )
  }
}

CRUDListContainer.propTypes = {
  addUrl: PropTypes.string,
  editUrl: PropTypes.string,
}

export default compose(
  withRouter,
  withApollo
)(CRUDListContainer)
