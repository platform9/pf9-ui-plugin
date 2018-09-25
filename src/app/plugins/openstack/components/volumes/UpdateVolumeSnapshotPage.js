import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataUpdater from 'core/DataUpdater'
import UpdateVolumeSnapshotForm from './UpdateVolumeSnapshotForm'
import { compose } from 'core/fp'
import { loadVolumeSnapshots, updateVolumeSnapshot } from './actions'

const UpdateVolumeSnapshotPage = props => (
  <DataUpdater
    dataKey="volumeSnapshots"
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
