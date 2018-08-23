import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import FloatingIpsListContainer from './FloatingIpsListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_FLOATING_IPS } from './actions'

const FloatingIpsListPage =
  ({ data: { loading, error, floatingIps } }) => {
    return (
      <div>
        <h1>Floating IPs Page</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {floatingIps && <FloatingIpsListContainer floatingIps={floatingIps} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_FLOATING_IPS),
)(FloatingIpsListPage)
