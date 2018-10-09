import React from 'react'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { compose } from 'core/fp'
import { loadCloudProviders } from './actions'

const CloudProvidersListPage = () =>
  <DataLoader dataKey="cloudProviders" loaderFn={loadCloudProviders}>
    {({ data }) => <pre>{JSON.stringify(data, null, 4)}</pre>}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(CloudProvidersListPage)
