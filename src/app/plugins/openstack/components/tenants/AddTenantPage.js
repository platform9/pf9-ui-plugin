import React from 'react'
import createAddComponents from 'core/createAddComponents'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import { createTenant, loadTenants } from './actions'

export const AddTenantForm = ({ onComplete }) => (
  <ValidatedForm onSubmit={onComplete}>
    <TextField id="name" label="Name" />
    <TextField id="description" label="Description" />
    <SubmitButton>Add Tenant</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: AddTenantForm,
  createFn: createTenant,
  loaderFn: loadTenants,
  listUrl: '/ui/openstack/tenants',
  name: 'AddTenant',
  title: 'Add Tenant',
}

const { AddPage } = createAddComponents(options)

export default AddPage
