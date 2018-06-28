import React from 'react'
import PropTypes from 'prop-types'

import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'

import UsersList from './UsersList'
import { GET_USERS, REMOVE_USER } from './actions'

class UsersListContainer extends React.Component {
  render () {
    return (
      <CRUDListContainer
        items={this.props.users}
        str="users"
        client={this.props.client}
        getQuery={GET_USERS}
        removeQuery={REMOVE_USER}
        addUrl="/ui/openstack/users/add"
        editUrl="/ui/openstack/users/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <UsersList
            users={this.props.users}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

UsersListContainer.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object)
}

export default withApollo(UsersListContainer)
