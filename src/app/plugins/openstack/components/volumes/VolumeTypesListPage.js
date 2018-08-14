import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import VolumeTypesListContainer from './VolumeTypesListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_VOLUME_TYPES } from './actions'

const VolumesListPage =
  ({ data, loading, error }) => {
    return (
      <div>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data && <VolumeTypesListContainer volumeTypes={data.volumeTypes} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_VOLUME_TYPES),
)(VolumesListPage)
