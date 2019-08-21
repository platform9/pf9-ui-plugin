import React from 'react'
import ApiClient from 'api-client/ApiClient'
import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import requiresAuthentication from '../../util/requiresAuthentication'
import HostsListContainer from './HostsListContainer'
import createContextLoader from 'core/helpers/createContextLoader'

const loadHosts = createContextLoader('hosts', async ({ context }) => {
  // const hosts = await ApiClient.getInstance().resmgr.getHosts()
  return ApiClient.getInstance().nova.getHypervisors()
})

const HostsListPage = () =>
  <DataLoader loaders={{ hosts: loadHosts }}>
    {({ data }) => <HostsListContainer hosts={data.hosts} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(HostsListPage)
