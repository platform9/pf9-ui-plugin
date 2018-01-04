import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataUpdater from 'core/DataUpdater'
import UpdateVolumeForm from './UpdateVolumeForm'
import { compose } from 'core/../../../../utils/fp'
import { loadVolumes, updateVolume } from './actions'

const UpdateVolumePage = props => (
  <DataUpdater
    dataKey="volumes"
    loaderFn={loadVolumes}
    updateFn={updateVolume}
    objId={props.match.params.volumeId}
  >
    {({ data, onSubmit }) =>
      <FormWrapper title="Update Volume" backUrl="/ui/openstack/storage#volumes">
        <UpdateVolumeForm volume={data} onSubmit={onSubmit} />
      </FormWrapper>
    }
  </DataUpdater>
)

export default compose(
  requiresAuthentication,
)(UpdateVolumePage)
