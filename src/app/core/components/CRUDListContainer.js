import { asyncMap, compose } from 'app/utils/fp'
import PropTypes from 'prop-types'
import React from 'react'
import { withRouter } from 'react-router-dom'
import ConfirmationDialog from './ConfirmationDialog'
import Progress from 'core/components/progress/Progress'

class CRUDListContainer extends React.Component {
  componentDidMount () {
    if (this.props.getQuery) {
      console.error(`TODO: remove getQuery usage from CRUDListContainer`)
    }
  }

  state = {
    showConfirmation: false,
    selectedItems: null,
    deleting: false,
  }

  deleteConfirmText = () => {
    const { selectedItems } = this.state
    if (!selectedItems) {
      return
    }
    const selectedNames = selectedItems.map(x => x.name).join(', ')
    return `This will permanently delete the following: ${selectedNames}`
  }

  handleDelete = selected => {
    this.setState({ showConfirmation: true, selectedItems: selected })
    // Stash the promise resolver so it can used to resolve later on in
    // response to user interaction (delete confirmation).
    return new Promise(resolve => { this.resolveDelete = resolve })
  }

  handleDeleteCancel = () => {
    this.setState({ showConfirmation: false })
  }

  handleDeleteConfirm = async () => {
    const { uniqueIdentifier } = this.props
    this.setState({ showConfirmation: false, deleting: true })
    const items = this.state.selectedItems || []

    await asyncMap(items, async item => {
      const uid = uniqueIdentifier instanceof Function
        ? uniqueIdentifier(item)
        : item[uniqueIdentifier]
      return this.handleRemove(uid)
    },
    // Items will be deleted sequentially, otherwise we would run in a race condition
    // causing the context to be incorrectly updated with just one item removed
    false)

    this.setState({ selectedItems: [], deleting: false })
    // The user resolves the promise by clicking "confirm".
    this.resolveDelete()
  }

  handleRemove = async id => {
    const { onRemove } = this.props

    if (onRemove) {
      return onRemove(id)
    }
    return null
  }

  redirectToAdd = () => {
    if (this.props.addUrl) {
      this.props.history.push(this.props.addUrl)
    }
  }

  redirectToEdit = (selectedIds) => {
    const { uniqueIdentifier } = this.props
    if (this.props.editUrl) {
      const selectedId = selectedIds[0][uniqueIdentifier]
      this.props.history.push(`${this.props.editUrl}/${selectedId}`)
    }
  }

  render () {
    return (
      <Progress renderContentOnMount overlay loading={this.state.deleting || this.props.loading}>
        <ConfirmationDialog
          open={this.state.showConfirmation}
          text={this.deleteConfirmText()}
          onCancel={this.handleDeleteCancel}
          onConfirm={this.handleDeleteConfirm}
        />
        {this.props.children({
          onDelete: this.handleDelete,
          onAdd: this.props.addUrl && this.redirectToAdd,
          onEdit: this.props.editUrl && this.redirectToEdit,
        })}
      </Progress>
    )
  }
}

CRUDListContainer.propTypes = {
  loading: PropTypes.bool,
  addUrl: PropTypes.string,
  editUrl: PropTypes.string,

  /**
   * Handler that is responsible for deleting the entity.
   * It is passed the id of the entity.
   */
  onRemove: PropTypes.func,

  /*
    Some objects have a unique identifier other than 'id'
    For example sshKeys have unique identifier of 'name' and the APIs
    rely on using the name as part of the URI. Specify the unique identifier
    in props if it is different from 'id'

    For more complicated scenarios, you can pass a funciton that receives the row data and returns the uid.
    It has the following type signature:
      uniqueIdentifier :: RowData -> String
  */
  uniqueIdentifier: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
}

CRUDListContainer.defaultProps = {
  uniqueIdentifier: 'id',
}

export default compose(
  withRouter,
)(CRUDListContainer)
