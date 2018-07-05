import React from 'react'
import { UPDATE_VOLUME } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateVolumeForm = ({ volume, objId }) =>
  <ValidatedForm
    initialValue={volume}
    objId={objId}
    updateQuery={UPDATE_VOLUME}
    action="update"
    backUrl="/ui/openstack/storage#volumes"
  >
    <TextField id="name" label="Volume Name" />
    <TextField id="description" label="Description" />
    <Checkbox id="bootable" label="Bootable" />
    <Button type="submit" variant="raised">Update Volume</Button>
  </ValidatedForm>

export default UpdateVolumeForm
