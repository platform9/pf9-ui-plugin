import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import TenantsListContainer from './TenantsListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_TENANTS } from './actions'

const TenantsPage =
  ({ data, loading, error }) => {
    return (
      <div>
        <h1>Tenants Page</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data && <TenantsListContainer tenants={data.tenants} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_TENANTS),
)(TenantsPage)
