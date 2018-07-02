import React from 'react'
import { ADD_NETWORK, GET_NETWORKS } from './actions'
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

const AddNetworkForm = () =>
  <ValidatedForm
    initialValue={initialValue}
    backUrl="/ui/openstack/networks"
    action="add"
    addQuery={ADD_NETWORK}
    getQuery={GET_NETWORKS}
    objType="networks"
    cacheQuery="createNetwork"
  >
    <TextField id="name" label="Name" />
    <TextField id="subnets" label="Subnets Associated" />
    <TextField id="tenant" label="Tenant" />
    <Checkbox id="shared" label="Shared" />
    <Checkbox id="port_security_enabled" label="Port Security" />
    <Checkbox id="external" label="External Network" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <Button type="submit" variant="raised">Add Network</Button>
  </ValidatedForm>

export default AddNetworkForm
