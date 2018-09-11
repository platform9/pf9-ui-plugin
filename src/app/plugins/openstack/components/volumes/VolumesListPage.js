import React from 'react'
import VolumesListContainer from './VolumesListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'
import { compose } from 'core/fp'
import { loadVolumes } from './actions'

const VolumesListPage = () =>
  <DataLoader dataKey="volumes" loaderFn={loadVolumes}>
    {({ data }) => <VolumesListContainer volumes={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumesListPage)
