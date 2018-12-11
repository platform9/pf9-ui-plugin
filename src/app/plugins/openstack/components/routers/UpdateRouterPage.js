import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import Checkbox from 'core/common/validated_form/Checkbox'
import TextField from 'core/common/validated_form/TextField'
import { loadRouters, updateRouter } from './actions'

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
  FormComponent: UpdateRouterForm,
  routeParamKey: 'routerId',
  updateFn: updateRouter,
  loaderFn: loadRouters,
  listUrl: '/ui/openstack/routers',
  name: 'UpdateRouter',
  title: 'Update Router',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
