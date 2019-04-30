import React from 'react'
import { compose } from 'app/utils/fp'
import FormWrapper from 'core/components/FormWrapper'
import DataUpdater from 'core/DataUpdater'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumes, updateVolume } from './actions'
import UpdateVolumeForm from './UpdateVolumeForm'

const UpdateVolumePage = props => (
  <DataUpdater
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
