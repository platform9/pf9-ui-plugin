import React from 'react'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'

const UpdateVolumeSnapshotForm = ({ volumeSnapshot, onSubmit }) =>
  <ValidatedForm
    initialValues={volumeSnapshot}
    backUrl="/ui/openstack/storage#volumeSnapshots"
    onSubmit={onSubmit}
  >
    <TextField id="name" label="Volume Snapshot Name" />
    <TextField id="description" label="Description" />
    <KeyValuesField id="metadata" label="Metadata" />
    <SubmitButton>Update Volume Snapshot</SubmitButton>
  </ValidatedForm>

export default UpdateVolumeSnapshotForm
