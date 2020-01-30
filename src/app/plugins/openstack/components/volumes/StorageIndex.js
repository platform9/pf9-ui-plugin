import React from 'react'
import Tabs from 'core/components/tabs/Tabs'
import Tab from 'core/components/tabs/Tab'
import VolumesListPage from './VolumesListPage'
import VolumeTypesListPage from './VolumeTypesListPage'
import VolumeSnapshotsListPage from './VolumeSnapshotsListPage'
import PageContainer from 'core/components/pageContainer/PageContainer'

const StorageIndex = () => (
  <PageContainer>
    <Tabs>
      <Tab value="volumes" label="Volumes"><VolumesListPage /></Tab>
      <Tab value="volumeTypes" label="Volume Types"><VolumeTypesListPage /></Tab>
      <Tab value="volumeSnapshots" label="Volume Snapshots"><VolumeSnapshotsListPage /></Tab>
    </Tabs>
  </PageContainer>
)

export default StorageIndex
