import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import Checkbox from 'core/common/validated_form/Checkbox'
import TextField from 'core/common/validated_form/TextField'
import { loadNetworks, updateNetwork } from './actions'

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
  updateFn: updateNetwork,
  loaderFn: loadNetworks,
  listUrl: '/ui/openstack/networks',
  name: 'UpdateNetwork',
  title: 'Update Network',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
