import React from 'react'
import PropTypes from 'prop-types'

import { withApollo } from 'react-apollo'
import CRUDListContainer from 'core/common/CRUDListContainer'

import UsersList from './UsersList'
import { GET_USERS, REMOVE_USER } from './actions'

class UsersListContainer extends React.Component {
  handleRemove = async id => {
    const { client } = this.props
    client.mutate({
      mutation: REMOVE_USER,
      variables: { id },
      update: cache => {
        const data = cache.readQuery({ query: GET_USERS })
        data.users = data.users.filter(x => x.id !== id)
        cache.writeQuery({ query: GET_USERS, data })
      }
    })
  }

  render () {
    return (
      <CRUDListContainer
        items={this.props.users}
        onRemove={this.handleRemove}
        addUrl="/ui/openstack/users/add"
      >
        {({ onDelete, onAdd }) => (
          <UsersList
            users={this.props.users}
            onAdd={onAdd}
            onDelete={onDelete}
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
