import { compose } from 'app/utils/fp'
import DataLoader from 'core/DataLoader'
import React from 'react'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumes } from './actions'
import VolumesListContainer from './VolumesListContainer'

const VolumesListPage = () =>
  <DataLoader dataKey="volumes" loaders={loadVolumes}>
    {({ data }) => <VolumesListContainer volumes={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumesListPage)
