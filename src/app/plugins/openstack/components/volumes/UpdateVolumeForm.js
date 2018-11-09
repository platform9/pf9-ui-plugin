import React from 'react'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'
import Checkbox from 'core/common/validated_form/Checkbox'

const UpdateVolumeForm = ({ volume, onSubmit }) =>
  <ValidatedForm
    initialValues={volume}
    backUrl="/ui/openstack/storage#volumes"
  >
    <TextField id="name" label="Volume Name" />
    <TextField id="description" label="Description" />
    <Checkbox id="bootable" label="Bootable" />
    <Button type="submit" variant="raised">Update Volume</Button>
  </ValidatedForm>

export default UpdateVolumeForm
