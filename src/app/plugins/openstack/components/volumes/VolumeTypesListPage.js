import React from 'react'
import VolumeTypesListContainer from './VolumeTypesListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { compose } from 'core/../../../../utils/fp'
import { loadVolumeTypes } from './actions'

const VolumesListPage = () =>
  <DataLoader dataKey="volumeTypes" loaderFn={loadVolumeTypes}>
    {({ data }) => <VolumeTypesListContainer volumeTypes={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumesListPage)
