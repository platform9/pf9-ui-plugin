import React from 'react'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'
import KeyValuesField from 'core/common/validated_form/KeyValuesField'

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
