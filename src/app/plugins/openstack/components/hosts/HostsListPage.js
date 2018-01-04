import React from 'react'

import { compose } from 'core/../../../../utils/fp'
import HostsListContainer from './HostsListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'

const loadHosts = async ({ setContext, context }) => {
  // const hosts = await context.apiClient.resmgr.getHosts()
  const hosts = await context.apiClient.nova.getHypervisors()
  setContext({ hosts })
}

const HostsListPage = () =>
  <DataLoader dataKey="hosts" loaderFn={loadHosts}>
    {({ data }) => <HostsListContainer hosts={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(HostsListPage)
