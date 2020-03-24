import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import DataUpdater from 'core/DataUpdater'
import { volumeTypeActions } from './actions'
import UpdateVolumeTypeForm from './UpdateVolumeTypeForm'
import { withRouter } from 'react-router'

const UpdateVolumeTypePage = props => (
  <DataUpdater
    loaderFn={volumeTypeActions.list}
    updateFn={volumeTypeActions.update}
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

export default withRouter(UpdateVolumeTypePage)
