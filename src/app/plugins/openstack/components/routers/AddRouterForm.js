import React from 'react'
import { ADD_ROUTER, GET_ROUTERS } from './actions'
import Button from '@material-ui/core/Button'
import ValidatedForm from 'core/common/ValidatedForm'
import Checkbox from 'core/common/Checkbox'
import TextField from 'core/common/TextField'

const initialValue = {
  name: '',
  tenant_id: '',
  admin_state_up: false,
  status: ''
}

const AddRouterForm = () =>
  <ValidatedForm
    initialValue={initialValue}
    backUrl="/ui/openstack/routers"
    action="add"
    addQuery={ADD_ROUTER}
    getQuery={GET_ROUTERS}
    objType="routers"
    cacheQuery="createRouter"
  >
    <TextField id="name" label="Name" />
    <TextField id="tenant_id" label="Tenant ID" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <TextField id="status" label="Status" />
    <Button type="submit" variant="raised">Add Router</Button>
  </ValidatedForm>

export default AddRouterForm
