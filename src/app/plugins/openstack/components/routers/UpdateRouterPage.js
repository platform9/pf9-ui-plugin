import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Checkbox from 'core/components/validatedForm/CheckboxField'
import TextField from 'core/components/validatedForm/TextField'
import { routersCacheKey } from './actions'

export const UpdateRouterForm = ({ onComplete, initialValue }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValue}>
    <TextField id="name" label="Name" />
    <TextField id="tenant_id" label="Tenant ID" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <TextField id="status" label="Status" />
    <SubmitButton>Update Router</SubmitButton>
  </ValidatedForm>
)

export const options = {
  cacheKey: routersCacheKey,
  FormComponent: UpdateRouterForm,
  routeParamKey: 'routerId',
  listUrl: '/ui/openstack/routers',
  name: 'UpdateRouter',
  title: 'Update Router',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
