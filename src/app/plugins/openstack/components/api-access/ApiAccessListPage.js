import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import ApiAccessListContainer from './ApiAccessListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_CATALOG } from './actions'

const ApiAccessPage =
  ({ data: { loading, error, serviceCatalog } }) => {
    return (
      <div>
        <h1>API Access</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {serviceCatalog && <ApiAccessListContainer catalog={serviceCatalog} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_CATALOG),
)(ApiAccessPage)
