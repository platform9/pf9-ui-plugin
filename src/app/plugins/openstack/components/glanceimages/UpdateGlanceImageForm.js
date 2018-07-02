import React from 'react'
import { UPDATE_GLANCEIMAGE } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateGlanceImageForm = ({ glanceImage, objId }) =>
  <ValidatedForm
    initialValue={glanceImage}
    objId={objId}
    updateQuery={UPDATE_GLANCEIMAGE}
    action="update"
    backUrl="/ui/openstack/glanceimages"
  >
    <TextField id="name" label="Name" />
    <TextField id="description" label="description" />
    <TextField id="owner" label="Tenant" />
    <TextField id="visibility" label="Visibility" />
    <Checkbox id="protected" label="Protected" />
    <TextField id="tags" label="Tags" />
    <Button type="submit" variant="raised">Update Flavor</Button>
  </ValidatedForm>

export default UpdateGlanceImageForm
