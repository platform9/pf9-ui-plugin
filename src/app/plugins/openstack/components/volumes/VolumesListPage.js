import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import VolumesListContainer from './VolumesListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_VOLUMES } from './actions'

const VolumesListPage =
  ({ data, loading, error }) => {
    return (
      <div>
        <h1>Volumes Page</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data && <VolumesListContainer volumes={data.volumes} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_VOLUMES),
)(VolumesListPage)
