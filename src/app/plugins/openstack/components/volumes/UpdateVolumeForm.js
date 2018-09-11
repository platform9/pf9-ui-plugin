import React from 'react'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateVolumeForm = ({ volume, onSubmit }) =>
  <ValidatedForm
    initialValue={volume}
    backUrl="/ui/openstack/storage#volumes"
  >
    <TextField id="name" label="Volume Name" />
    <TextField id="description" label="Description" />
    <Checkbox id="bootable" label="Bootable" />
    <Button type="submit" variant="raised">Update Volume</Button>
  </ValidatedForm>

export default UpdateVolumeForm
