import React from 'react'
import Tabs from 'core/common/Tabs'
import Tab from 'core/common/Tab'
import VolumesListPage from './VolumesListPage'
import VolumeTypesListPage from './VolumeTypesListPage'
import VolumeSnapshotsListPage from './VolumeSnapshotsListPage'

const StorageIndex = () => (
  <Tabs>
    <Tab value="volumes" label="Volumes"><VolumesListPage /></Tab>
    <Tab value="volumeTypes" label="Volume Types"><VolumeTypesListPage /></Tab>
    <Tab value="volumeSnapshots" label="Volume Snapshots"><VolumeSnapshotsListPage /></Tab>
  </Tabs>
)

export default StorageIndex
