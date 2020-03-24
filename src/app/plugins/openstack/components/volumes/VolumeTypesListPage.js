import DataLoader from 'core/DataLoader'
import React from 'react'
import { volumeTypeActions } from './actions'
import VolumeTypesListContainer from './VolumeTypesListContainer'

const VolumesListPage = () =>
  <DataLoader loaders={{ volumeTypes: volumeTypeActions.list }}>
    {({ data }) => <VolumeTypesListContainer volumeTypes={data.volumeTypes} />}
  </DataLoader>

export default VolumesListPage
