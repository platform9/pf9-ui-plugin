import React from 'react'

import { compose } from 'core/../../../../utils/fp'
import InstancesListContainer from './InstancesListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'

const loadInstances = async ({ setContext, context }) => {
  const instances = await context.apiClient.nova.getInstances()
  setContext({ instances })
}

const InstancesListPage = () =>
  <DataLoader dataKey="instances" loaderFn={loadInstances}>
    {({ data }) => <InstancesListContainer instances={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(InstancesListPage)
