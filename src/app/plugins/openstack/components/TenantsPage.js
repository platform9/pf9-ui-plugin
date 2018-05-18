import React from 'react'
import { compose, graphql, withApollo } from 'react-apollo'
import { gql } from 'apollo-boost'

import Loader from 'core/common/Loader'
import TenantsListContainer from './tenants/TenantsListContainer'
import requiresAuthentication from '../util/requiresAuthentication'

const GET_TENANTS = gql`
  {
    tenants {
      id
      name
      description
    }
  }
`

/*
const REMOVE_TENANT = gql`
  mutation removeTenant($id: ID) {
    removeTenant(id: $id) {
      id
    }
  }
`
*/

const TenantsPage =
  ({ data, loading, error, client }) => {
    console.log(client)
    return (
      <div>
        <h1>Tenants Page</h1>
        {loading && <Loader />}
        {error && <h3>TODO: error handler</h3>}
        {data && <TenantsListContainer tenants={data.tenants} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_TENANTS),
  withApollo,
)(TenantsPage)
