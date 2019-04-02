import React from 'react'
import createAddComponents from 'core/helpers/createAddComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Checkbox from 'core/components/validatedForm/CheckboxField'
import TextField from 'core/components/validatedForm/TextField'
import { createNetwork, loadNetworks } from './actions'

const initialValue = {
  name: '',
  subnets: '',
  tenant: '',
  shared: false,
  port_security_enabled: false,
  external: false,
  admin_state_up: false,
  status: ''
}

export const AddNetworkForm = ({ onComplete }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValue}>
    <TextField id="name" label="Name" />
    <TextField id="subnets" label="Subnets Associated" />
    <TextField id="tenant" label="Tenant" />
    <Checkbox id="shared" label="Shared" />
    <Checkbox id="port_security_enabled" label="Port Security" />
    <Checkbox id="external" label="External Network" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <SubmitButton>Add Network</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: AddNetworkForm,
  createFn: createNetwork,
  loaderFn: loadNetworks,
  listUrl: '/ui/openstack/networks',
  name: 'AddNetwork',
  title: 'Add Network',
}

const { AddPage } = createAddComponents(options)

export default AddPage
