import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import DataUpdater from 'core/DataUpdater'
import { volumeActions } from './actions'
import UpdateVolumeForm from './UpdateVolumeForm'

const UpdateVolumePage = props => (
  <DataUpdater
    loaderFn={volumeActions.list}
    updateFn={volumeActions.update}
    objId={props.match.params.volumeId}
  >
    {({ data, onSubmit }) =>
      <FormWrapper title="Update Volume" backUrl="/ui/openstack/storage#volumes">
        <UpdateVolumeForm volume={data} onSubmit={onSubmit} />
      </FormWrapper>
    }
  </DataUpdater>
)

export default UpdateVolumePage
