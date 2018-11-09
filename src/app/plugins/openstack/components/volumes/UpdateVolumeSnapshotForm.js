import React from 'react'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'
import KeyValuesField from 'core/common/validated_form/KeyValuesField'

const UpdateVolumeSnapshotForm = ({ volumeSnapshot, onSubmit }) =>
  <ValidatedForm
    initialValues={volumeSnapshot}
    backUrl="/ui/openstack/storage#volumeSnapshots"
    onSubmit={onSubmit}
  >
    <TextField id="name" label="Volume Snapshot Name" />
    <TextField id="description" label="Description" />
    <KeyValuesField id="metadata" label="Metadata" />
    <Button type="submit" variant="raised">Update Volume Snapshot</Button>
  </ValidatedForm>

export default UpdateVolumeSnapshotForm
