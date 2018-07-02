import React from 'react'
import { UPDATE_ROUTER } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateRouterForm = ({ router, objId }) =>
  <ValidatedForm
    initialValue={router}
    objId={objId}
    updateQuery={UPDATE_ROUTER}
    action="update"
    backUrl="/ui/openstack/routers"
  >
    <TextField id="name" label="name" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <Button type="submit" variant="raised">Update Router</Button>
  </ValidatedForm>

export default UpdateRouterForm
