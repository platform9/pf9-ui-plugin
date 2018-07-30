import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import ApplicationsListContainer from './ApplicationsListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_APPLICATIONS } from './actions'

const ApplicationsPage =
  ({ data, loading, error }) => {
    return (
      <div>
        <h1>Applications</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data && <ApplicationsListContainer applications={data.applications} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_APPLICATIONS),
)(ApplicationsPage)
