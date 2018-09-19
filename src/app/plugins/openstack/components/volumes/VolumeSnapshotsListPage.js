import React from 'react'
import VolumeSnapshotsListContainer from './VolumeSnapshotsListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { compose } from 'core/fp'
import { loadVolumeSnapshots } from './actions'

const VolumeSnapshotsListPage = () =>
  <DataLoader dataKey="volumes" loaderFn={loadVolumeSnapshots}>
    {({ data }) => <VolumeSnapshotsListContainer volumes={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumeSnapshotsListPage)
