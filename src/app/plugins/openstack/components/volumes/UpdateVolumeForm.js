import React from 'react'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import Checkbox from 'core/components/validatedForm/Checkbox'

const UpdateVolumeForm = ({ volume, onSubmit }) =>
  <ValidatedForm
    initialValues={volume}
    backUrl="/ui/openstack/storage#volumes"
  >
    <TextField id="name" label="Volume Name" />
    <TextField id="description" label="Description" />
    <Checkbox id="bootable" label="Bootable" />
    <SubmitButton>Update Volume</SubmitButton>
  </ValidatedForm>

export default UpdateVolumeForm
