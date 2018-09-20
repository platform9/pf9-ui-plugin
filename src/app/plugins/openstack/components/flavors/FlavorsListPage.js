import React from 'react'
import { compose } from 'react-apollo'
import FlavorsListContainer from './FlavorsListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { loadFlavors } from './actions'

const FlavorsListPage = () =>
  <DataLoader dataKey="flavors" loaderFn={loadFlavors}>
    {({ data }) => <FlavorsListContainer flavors={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(FlavorsListPage)
