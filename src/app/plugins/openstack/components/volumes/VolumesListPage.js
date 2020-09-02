import DataLoader from 'core/DataLoader'
import React from 'react'
import { volumeActions } from './actions'
import VolumesListContainer from './VolumesListContainer'

const VolumesListPage = () =>
  <DataLoader loaders={{ volumes: volumeActions.list }}>
    {({ data }) => <VolumesListContainer volumes={data.volumes} />}
  </DataLoader>

export default VolumesListPage
