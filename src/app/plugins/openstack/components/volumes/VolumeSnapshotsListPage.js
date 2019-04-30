import React from 'react'
import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumeSnapshots } from './actions'
import VolumeSnapshotsListContainer from './VolumeSnapshotsListContainer'

const VolumeSnapshotsListPage = () =>
  <DataLoader dataKey="volumeSnapshots" loaders={loadVolumeSnapshots}>
    {({ data }) => <VolumeSnapshotsListContainer volumeSnapshots={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumeSnapshotsListPage)
