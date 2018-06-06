import React from 'react'
import { compose, graphql } from 'react-apollo'

import DisplayError from 'core/common/DisplayError'
import Loader from 'core/common/Loader'
import FlavorsListContainer from './FlavorsListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import { GET_FLAVORS } from './actions'

const FlavorsPage =
  ({ data, loading, error }) => {
    return (
      <div>
        <h1>Flavors</h1>
        {loading && <Loader />}
        {error && <DisplayError error={error} />}
        {data && <FlavorsListContainer flavors={data.flavors} />}
      </div>
    )
  }

export default compose(
  requiresAuthentication,
  graphql(GET_FLAVORS),
)(FlavorsPage)
