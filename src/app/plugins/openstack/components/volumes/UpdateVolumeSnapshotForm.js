import React from 'react'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const UpdateVolumeSnapshotForm = ({ volumeSnapshot, onSubmit }) =>
  <ValidatedForm
    initialValue={volumeSnapshot}
    backUrl="/ui/openstack/storage#volumeSnapshots"
    onSubmit={onSubmit}
  >
    <TextField id="name" label="Volume Snapshot Name" />
    <TextField id="description" label="Description" />
    <Button type="submit" variant="raised">Update Volume Snapshot</Button>
  </ValidatedForm>

export default UpdateVolumeSnapshotForm
