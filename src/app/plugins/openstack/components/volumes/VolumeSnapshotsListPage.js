import React from 'react'
import VolumeSnapshotsListContainer from './VolumeSnapshotsListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { compose } from 'core/../../../../utils/fp'
import { loadVolumeSnapshots } from './actions'

const VolumeSnapshotsListPage = () =>
  <DataLoader dataKey="volumeSnapshots" loaderFn={loadVolumeSnapshots}>
    {({ data }) => <VolumeSnapshotsListContainer volumeSnapshots={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumeSnapshotsListPage)
