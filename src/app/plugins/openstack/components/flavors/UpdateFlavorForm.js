import React from 'react'
import { UPDATE_FLAVOR } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const UpdateFlavorForm = ({ flavor, objId }) =>
  <ValidatedForm
    initialValue={flavor}
    objId={objId}
    updateQuery={UPDATE_FLAVOR}
    action="update"
    backUrl="/ui/openstack/flavors"
  >
    <TextField id="name" label="Name" disabled />
    <TextField id="tags" label="Tags" />
    <Button type="submit" variant="raised">Update Flavor</Button>
  </ValidatedForm>

export default UpdateFlavorForm
