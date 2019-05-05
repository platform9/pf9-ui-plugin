import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import React from 'react'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumes } from './actions'
import VolumesListContainer from './VolumesListContainer'

const VolumesListPage = () =>
  <DataLoader loaders={{ volumes: loadVolumes }}>
    {({ data }) => <VolumesListContainer volumes={data.volumes} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumesListPage)
