import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { loadFloatingIps, updateFloatingIp } from './actions'

export const UpdateFloatingIpForm = ({ onComplete, initialValue }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValue}>
    <TextField id="floating_ip_address" label="Floating IP Address" />
    <TextField id="fixed_ip_address" label="Fixed IP Address" />
    <SubmitButton>Update Floating IP</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: UpdateFloatingIpForm,
  routeParamKey: 'floatingIpId',
  updateFn: updateFloatingIp,
  loaderFn: loadFloatingIps,
  listUrl: '/ui/openstack/floatingips',
  name: 'UpdateFloatingIp',
  title: 'Update Floating IP',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
