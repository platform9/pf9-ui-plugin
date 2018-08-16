import React from 'react'

import { compose } from 'core/fp'
import VolumeTypesListContainer from './VolumeTypesListContainer'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataLoader from 'core/DataLoader'

const loadVolumeTypes = async ({ setContext, context }) => {
  console.log('22222222222222')
  const volumeTypes = await context.openstackClient.cinder.getVolumeTypes()
  console.log('3333333333')
  setContext({ volumeTypes })
}

const VolumesListPage = () =>
  <DataLoader dataKey="volumeTypes" loaderFn={loadVolumeTypes}>
    {({ data }) => <VolumeTypesListContainer volumeTypes={data} />}
  </DataLoader>

export default compose(
  requiresAuthentication,
)(VolumesListPage)
