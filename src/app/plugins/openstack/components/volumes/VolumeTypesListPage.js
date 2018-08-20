import React from 'react'

import { compose } from 'core/fp'
import VolumeTypesListContainer from './VolumeTypesListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'

const loadVolumeTypes = async ({ setContext, context }) => {
  const volumeTypes = await context.openstackClient.cinder.getVolumeTypes()
  setContext({ volumeTypes })
}

const VolumesListPage = () =>
  <DataLoader dataKey="volumeTypes" loaderFn={loadVolumeTypes}>
    {({ data }) => <VolumeTypesListContainer volumeTypes={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumesListPage)
