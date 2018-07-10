import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import NetworksListContainer from './NetworksListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_NETWORKS } from './actions'

const NetworksListPage =
  ({ data: { loading, error, networks } }) => {
    return (
      <div>
        <h1>Networks Page</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {networks && <NetworksListContainer networks={networks} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_NETWORKS),
)(NetworksListPage)
