import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataUpdater from 'core/DataUpdater'
import UpdateVolumeTypeForm from './UpdateVolumeTypeForm'
import { compose } from 'core/../../../../utils/fp'
import { loadVolumeTypes, updateVolumeType } from './actions'

const UpdateVolumeTypePage = props => (
  <DataUpdater
    dataKey="volumeTypes"
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
