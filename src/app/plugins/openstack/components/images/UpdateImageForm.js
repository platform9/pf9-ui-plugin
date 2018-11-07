import React from 'react'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateImageForm = ({ image, onSubmit }) => (
  <ValidatedForm
    initialValue={image}
    backUrl="/ui/openstack/images"
    onSubmit={onSubmit}
  >
    <TextField id="name" label="Name" />
    <TextField id="pf9_description" label="Description" />
    <TextField id="owner" label="Tenant" />
    <TextField id="visibility" label="Visibility" />
    <Checkbox id="protected" label="Protected" />
    <TextField id="tags" label="Tags" />
    <Button type="submit" variant="raised">
      Update Image
    </Button>
  </ValidatedForm>
)

export default UpdateImageForm
