import React from 'react'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'

const UpdateVolumeTypeForm = ({ volumeType, onSubmit }) =>
  <ValidatedForm
    initialValues={volumeType}
    backUrl="/ui/openstack/storage#volumeTypes"
    onSubmit={onSubmit}
  >
    <TextField id="name" label="Volume Type Name" />
    <KeyValuesField id="extra_specs" label="Metadata" />
    <SubmitButton>Update Volume Type</SubmitButton>
  </ValidatedForm>

export default UpdateVolumeTypeForm
