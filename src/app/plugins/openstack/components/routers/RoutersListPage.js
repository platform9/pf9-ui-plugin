import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import RoutersListContainer from './RoutersListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_ROUTERS } from './actions'

const RoutersListPage =
  ({ data: { loading, error, routers } }) => {
    return (
      <div>
        <h1>Routers Page</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {routers && <RoutersListContainer routers={routers} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_ROUTERS),
)(RoutersListPage)
