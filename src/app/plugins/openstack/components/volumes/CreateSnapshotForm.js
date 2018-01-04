import React from 'react'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'

const CreateSnapshotForm = ({ onComplete }) =>
  <ValidatedForm
    backUrl="/ui/openstack/storage#volumes"
    onSubmit={onComplete}
  >
    <TextField id="name" label="Volume Name" />
    <TextField id="description" label="Description" />
    <SubmitButton>Snapshot Volume</SubmitButton>
  </ValidatedForm>

export default CreateSnapshotForm
