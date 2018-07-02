import React from 'react'
import { ADD_TENANT, GET_TENANTS } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const AddTenantForm = () =>
  <ValidatedForm
    backUrl="/ui/openstack/tenants"
    action="add"
    addQuery={ADD_TENANT}
    getQuery={GET_TENANTS}
    objType="tenants"
    cacheQuery="createTenant"
  >
    <TextField id="name" label="Name" />
    <TextField id="description" label="Description" />
    <Button type="submit" variant="raised">Add Tenant</Button>
  </ValidatedForm>

export default AddTenantForm
