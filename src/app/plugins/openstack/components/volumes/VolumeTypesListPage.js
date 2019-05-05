import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import React from 'react'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumeTypes } from './actions'
import VolumeTypesListContainer from './VolumeTypesListContainer'

const VolumesListPage = () =>
  <DataLoader loaders={{ volumeTypes: loadVolumeTypes }}>
    {({ data }) => <VolumeTypesListContainer volumeTypes={data.volumeTypes} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumesListPage)
