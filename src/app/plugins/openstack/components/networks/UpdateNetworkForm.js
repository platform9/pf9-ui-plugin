import React from 'react'
import { UPDATE_NETWORK } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'
import Checkbox from 'core/common/Checkbox'

const UpdateNetworkForm = ({ network, objId }) =>
  <ValidatedForm
    initialValue={network}
    objId={objId}
    updateQuery={UPDATE_NETWORK}
    action="update"
    backUrl="/ui/openstack/networks"
  >
    <TextField id="name" label="Name" />
    <Checkbox id="admin_state_up" label="Admin State" />
    <Checkbox id="port_security_enabled" label="Port Security" />
    <Checkbox id="shared" label="Shared" />
    <Checkbox id="external" label="External Network" />
    <Button type="submit" variant="raised">Update Network</Button>
  </ValidatedForm>

export default UpdateNetworkForm
