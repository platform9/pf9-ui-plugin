import React from 'react'
import { ADD_FLOATING_IP, GET_FLOATING_IPS } from './actions'
import Button from '@material-ui/core/Button'
import GraphQLAddForm from 'core/common/GraphQLAddForm'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

// TODO: neutron api doesn't like empty strings, if empty the form should send nothing

const initialValue = {
  // floating_ip_address: '',
  // fixed_ip_address: '',
  floating_network_id: '',
}

const AddFloatingIpForm = () =>
  <GraphQLAddForm
    backUrl="/ui/openstack/floatingips"
    mutation={ADD_FLOATING_IP}
    getQuery={GET_FLOATING_IPS}
    objType="floatingIps"
  >
    {({ handleSubmit }) => (
      <ValidatedForm initialValue={initialValue} onSubmit={handleSubmit}>
        <TextField id="floating_network_id" label="Floating Network ID" />
        <Button type="submit" variant="raised">Add Floating IP</Button>
      </ValidatedForm>
    )}
  </GraphQLAddForm>

// <TextField id="floating_ip_address" label="Floating IP Address" />
// <TextField id="fixed_ip_address" label="Fixed IP Address" />

export default AddFloatingIpForm
