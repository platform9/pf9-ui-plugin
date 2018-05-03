import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import ConfirmationDialog from 'core/common/ConfirmationDialog'
import UsersList from './UsersList'

import { removeUser } from '../../actions/users'

const mapStateToProps = state => {
  const { users } = state.openstack
  return {
    users: users.users,
  }
}

@withRouter
@connect(mapStateToProps)
class UsersListContainer extends React.Component {
  state = {
    showConfirmation: false,
    userToDelete: null,
  }

  redirectToAdd = () => {
    this.props.history.push('/ui/openstack/users/add')
  }

  handleDelete = selectedIds => {
    this.setState({ showConfirmation: true })
    const selectedUsers = this.props.users.filter(user => selectedIds.includes(user.id))
    this.setState({ usersToDelete: selectedUsers })
  }

  handleDeleteCancel = () => {
    this.setState({ showConfirmation: false })
  }

  handleDeleteConfirm = () => {
    this.setState({ showConfirmation: false })
    const users = this.state.usersToDelete || []
    users.forEach(user => this.props.dispatch(removeUser(user.id)))
  }

  deleteConfirmText = () => {
    const { usersToDelete } = this.state
    if (!usersToDelete) {
      return
    }
    const userNames = usersToDelete.map(x => x.name).join(', ')
    return `This will permanently delete the following user(s): ${userNames}`
  }

  render () {
    const { users } = this.props

    return (
      <div>
        <ConfirmationDialog
          open={this.state.showConfirmation}
          text={this.deleteConfirmText()}
          onCancel={this.handleDeleteCancel}
          onConfirm={this.handleDeleteConfirm}
        />

        <UsersList
          users={users}
          onAdd={this.redirectToAdd}
          onDelete={this.handleDelete}
        />
      </div>
    )
  }
}

export default UsersListContainer
