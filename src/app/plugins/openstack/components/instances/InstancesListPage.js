import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import React from 'react'
import requiresAuthentication from '../../util/requiresAuthentication'
import InstancesListContainer from './InstancesListContainer'

const loadInstances = async ({ setContext, context }) => {
  const instances = await context.apiClient.nova.getInstances()
  setContext({ instances })
}

const InstancesListPage = () =>
  <DataLoader loaders={loadInstances}>
    {({ data }) => <InstancesListContainer instances={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(InstancesListPage)
