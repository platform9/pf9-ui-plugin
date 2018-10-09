import React from 'react'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { compose } from 'core/fp'
import { loadNodes } from './actions'

const NodesListPage = () =>
  <DataLoader dataKey="nodes" loaderFn={loadNodes}>
    {({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(NodesListPage)
