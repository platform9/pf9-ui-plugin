import React from 'react'
import createUpdateComponents from 'core/createUpdateComponents'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/ValidatedForm'
import Checkbox from 'core/common/Checkbox'
import TextField from 'core/common/TextField'
import { updateNetwork, loadNetworks } from './actions'

export const UpdateNetworkForm = ({ onComplete, initialValue }) => (
  <ValidatedForm onSubmit={onComplete} initialValue={initialValue}>
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
  updateFn: updateNetwork,
  loaderFn: loadNetworks,
  listUrl: '/ui/openstack/networks',
  name: 'UpdateNetwork',
  title: 'Update Network',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
