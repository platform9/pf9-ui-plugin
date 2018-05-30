import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import UsersListContainer from './UsersListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_USERS } from './actions'

const UsersListPage =
  ({ data, loading, error }) => {
    return (
      <div>
        <h1>Users Page</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data && <UsersListContainer users={data.users} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_USERS),
)(UsersListPage)
