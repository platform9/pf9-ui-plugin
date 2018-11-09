import React from 'react'
import createAddComponents from 'core/createAddComponents'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'
import { createFloatingIp, loadFloatingIps } from './actions'

export const AddFloatingIpForm = ({ onComplete }) => (
  <ValidatedForm onSubmit={onComplete}>
    <TextField id="floating_network_id" label="Floating Network ID" />
    <SubmitButton>Add Floating IP</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: AddFloatingIpForm,
  createFn: createFloatingIp,
  loaderFn: loadFloatingIps,
  listUrl: '/ui/openstack/floatingips',
  name: 'AddFloatingIp',
  title: 'Add Floating IP',
}

const { AddPage } = createAddComponents(options)

export default AddPage
