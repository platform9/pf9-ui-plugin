import React from 'react'
import { compose, graphql, withApollo } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import TenantsListContainer from './tenants/TenantsListContainer'
import requiresAuthentication from '../util/requiresAuthentication'
import { GET_TENANTS } from './tenants/actions'

const TenantsPage =
  ({ data, loading, error, client }) => {
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
  withApollo,
)(TenantsPage)
