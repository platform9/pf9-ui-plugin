import React from 'react'
import createAddComponents from 'core/helpers/createAddComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Checkbox from 'core/components/validatedForm/CheckboxField'
import TextField from 'core/components/validatedForm/TextField'
import { createRouter, loadRouters } from './actions'

export const AddRouterForm = ({ onComplete }) => (
  <ValidatedForm onSubmit={onComplete}>
    <TextField id="name" label="Name" />
    <TextField id="tenant_id" label="Tenant ID" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <TextField id="status" label="Status" />
    <SubmitButton>Add Router</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: AddRouterForm,
  createFn: createRouter,
  loaderFn: loadRouters,
  listUrl: '/ui/openstack/routers',
  name: 'AddRouter',
  title: 'Add Router',
}

const { AddPage } = createAddComponents(options)

export default AddPage
