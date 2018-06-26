import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import ValidatedForm from 'core/common/ValidatedForm'
import Checkbox from 'core/common/Checkbox'
import TextField from 'core/common/TextField'

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

const AddNetworkForm = ({ onSubmit }) =>
  <ValidatedForm initialValue={initialValue} onSubmit={onSubmit}>
    <TextField id="name" label="Name" />
    <TextField id="subnets" label="Subnets Associated" />
    <TextField id="tenant" label="Tenant" />
    <Checkbox id="shared" label="Shared" />
    <Checkbox id="port_security_enabled" label="Port Security" />
    <Checkbox id="external" label="External Network" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <Button type="submit" variant="raised">Add Network</Button>
  </ValidatedForm>

AddNetworkForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default AddNetworkForm
