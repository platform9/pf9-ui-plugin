import React from 'react'
import createAddComponents from 'core/helpers/createAddComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import DataKeys from 'k8s/DataKeys'

export const AddTenantForm = ({ onComplete }) => (
  <ValidatedForm onSubmit={onComplete}>
    <TextField id="name" label="Name" />
    <TextField id="description" label="Description" />
    <SubmitButton>Add Tenant</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: AddTenantForm,
  cacheKey: DataKeys.Tenants,
  listUrl: '/ui/openstack/tenants',
  name: 'AddTenant',
  title: 'Add Tenant',
}

const { AddPage } = createAddComponents(options)

export default AddPage
