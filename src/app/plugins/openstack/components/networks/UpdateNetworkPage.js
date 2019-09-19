import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Checkbox from 'core/components/validatedForm/CheckboxField'
import TextField from 'core/components/validatedForm/TextField'
import { networksCacheKey } from './actions'

export const UpdateNetworkForm = ({ onComplete, initialValue }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValue}>
    <TextField id="name" label="Name" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <Checkbox id="port_security_enabled" label="Port Security" />
    <Checkbox id="shared" label="Shared" />
    <Checkbox id="external" label="External Network" />
    <SubmitButton>Update Network</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: UpdateNetworkForm,
  routeParamKey: 'networkId',
  cacheKey: networksCacheKey,
  listUrl: '/ui/openstack/networks',
  name: 'UpdateNetwork',
  title: 'Update Network',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
