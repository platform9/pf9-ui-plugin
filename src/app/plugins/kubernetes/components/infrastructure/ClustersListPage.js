import React from 'react'
import ClustersListContainer from './ClustersListContainer'
import requiresAuthentication from 'openstack/util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { compose } from 'core/fp'
import { loadClusters } from './actions'

const ClustersListPage = () =>
  <DataLoader dataKey="clusters" loaderFn={loadClusters}>
    {({ data }) => (
      <div>
        <ClustersListContainer data={data} />
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </div>
    )}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(ClustersListPage)
