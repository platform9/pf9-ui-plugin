import FormWrapper from 'core/components/FormWrapper'
import DataUpdater from 'core/DataUpdater'
import React from 'react'
import { volumeSnapshotActions } from './actions'
import UpdateVolumeSnapshotForm from './UpdateVolumeSnapshotForm'
import { withRouter } from 'react-router'

const UpdateVolumeSnapshotPage = ({ match }) => (
  <DataUpdater
    loaderFn={volumeSnapshotActions.list}
    updateFn={volumeSnapshotActions.update}
    objId={match.params.volumeSnapshotId}
    backUrl="/ui/openstack/storage#volumeSnapshots"
  >
    {({ data, onSubmit }) =>
      <FormWrapper title="Update Volume Snapshot" backUrl="/ui/openstack/storage#volumeSnapshots">
        <UpdateVolumeSnapshotForm volumeSnapshot={data} onSubmit={onSubmit} />
      </FormWrapper>
    }
  </DataUpdater>
)

export default withRouter(UpdateVolumeSnapshotPage)
