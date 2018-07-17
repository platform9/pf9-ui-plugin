import React from 'react'
import { compose, graphql } from 'react-apollo'
import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import GlanceImageListContainer from './GlanceImageListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_GLANCEIMAGES } from './actions'

const GlanceImageListPage =
  ({ data, loading, error }) => {
    return (
      <div>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data && <GlanceImageListContainer glanceImages={data.glanceImages} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_GLANCEIMAGES),
)(GlanceImageListPage)
