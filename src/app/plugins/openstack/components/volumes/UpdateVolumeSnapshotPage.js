import { compose } from 'app/utils/fp'
import FormWrapper from 'core/components/FormWrapper'
import DataUpdater from 'core/DataUpdater'
import React from 'react'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumeSnapshots, updateVolumeSnapshot } from './actions'
import UpdateVolumeSnapshotForm from './UpdateVolumeSnapshotForm'

const UpdateVolumeSnapshotPage = props => (
  <DataUpdater
    loaderFn={loadVolumeSnapshots}
    updateFn={updateVolumeSnapshot}
    objId={props.match.params.volumeSnapshotId}
    backUrl="/ui/openstack/storage#volumeSnapshots"
  >
    {({ data, onSubmit }) =>
      <FormWrapper title="Update Volume Snapshot" backUrl="/ui/openstack/storage#volumeSnapshots">
        <UpdateVolumeSnapshotForm volumeSnapshot={data} onSubmit={onSubmit} />
      </FormWrapper>
    }
  </DataUpdater>
)

export default compose(
  requiresAuthentication,
)(UpdateVolumeSnapshotPage)
