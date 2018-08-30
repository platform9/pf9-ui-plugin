import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { compose, withApollo } from 'react-apollo'
import ConfirmationDialog from './ConfirmationDialog'

class CRUDListContainer extends React.Component {
  componentDidMount () {
    if (this.props.getQuery) {
      console.error(`TODO: remove getQuery usage from CRUDListContainer`)
    }
  }

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
    // Stash the promise resolver so it can used to resolve later on in
    // response to user interaction (delete confirmation).
    return new Promise(resolve => { this.resolveDelete = resolve })
  }

  handleDeleteCancel = () => {
    this.setState({ showConfirmation: false })
  }

  handleDeleteConfirm = () => {
    this.setState({ showConfirmation: false })
    const items = this.state.selectedItems || []
    items.forEach(item => this.handleRemove(item.id))
    this.setState({ selectedItems: [] })
    // The user resolves the promise by clicking "confirm".
    this.resolveDelete()
  }

  handleRemove = async id => {
    const { client, getQuery, objType, removeQuery, onRemove } = this.props
    if (getQuery) {
      // TODO: refactor any code that uses this path so we can decouple
      // GraphQL from CRUDListContainer
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

    if (onRemove) {
      onRemove(id)
    }
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
