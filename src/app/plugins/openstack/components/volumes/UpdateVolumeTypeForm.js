import React from 'react'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import KeyValuesField from 'core/common/KeyValuesField'

const UpdateVolumeTypeForm = ({ volumeType, onSubmit }) =>
  <ValidatedForm
    initialValue={volumeType}
    backUrl="/ui/openstack/storage#volumeTypes"
    onSubmit={onSubmit}
  >
    <TextField id="name" label="Volume Type Name" />
    <KeyValuesField id="extra_specs" label="Metadata" />
    <SubmitButton>Update Volume Type</SubmitButton>
  </ValidatedForm>

export default UpdateVolumeTypeForm
