import React from 'react'
import { compose } from 'app/utils/fp'
import FormWrapper from 'core/components/FormWrapper'
import DataUpdater from 'core/DataUpdater'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumeTypes, updateVolumeType } from './actions'
import UpdateVolumeTypeForm from './UpdateVolumeTypeForm'

const UpdateVolumeTypePage = props => (
  <DataUpdater
    loaderFn={loadVolumeTypes}
    updateFn={updateVolumeType}
    objId={props.match.params.volumeTypeId}
    backUrl="/ui/openstack/storage#volumeTypes"
  >
    {({ data, onSubmit }) =>
      <FormWrapper title="Update Volume Type" backUrl="/ui/openstack/storage#volumeTypes">
        <UpdateVolumeTypeForm volumeType={data} onSubmit={onSubmit} />
      </FormWrapper>
    }
  </DataUpdater>
)

export default compose(
  requiresAuthentication,
)(UpdateVolumeTypePage)
