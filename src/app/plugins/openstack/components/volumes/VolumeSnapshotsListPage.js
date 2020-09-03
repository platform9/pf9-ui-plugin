import React from 'react'
import DataLoader from 'core/DataLoader'
import { volumeSnapshotActions } from './actions'
import VolumeSnapshotsListContainer from './VolumeSnapshotsListContainer'

const VolumeSnapshotsListPage = () =>
  <DataLoader loaders={{ volumeSnapshots: volumeSnapshotActions.list }}>
    {({ data }) => <VolumeSnapshotsListContainer volumeSnapshots={data.volumeSnapshots} />}
  </DataLoader>

export default VolumeSnapshotsListPage
