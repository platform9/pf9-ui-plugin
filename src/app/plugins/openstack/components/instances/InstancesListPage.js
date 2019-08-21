import DataLoader from 'core/DataLoader'
import React from 'react'
import ApiClient from 'api-client/ApiClient'
import { compose } from 'app/utils/fp'
import requiresAuthentication from '../../util/requiresAuthentication'
import InstancesListContainer from './InstancesListContainer'
import createContextLoader from 'core/helpers/createContextLoader'

const loadInstances = createContextLoader('instances', async () => {
  const { nova } = ApiClient.getInstance()
  return nova.getInstances()
})

const InstancesListPage = () =>
  <DataLoader loaders={{ instances: loadInstances }}>
    {({ data }) => <InstancesListContainer instances={data.instances} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(InstancesListPage)
