import React from 'react'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'

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
