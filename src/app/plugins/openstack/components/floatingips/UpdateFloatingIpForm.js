import React from 'react'
import { UPDATE_FLOATING_IP } from './actions'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const UpdateFloatingIpForm = ({ floatingIp, objId }) =>
  <ValidatedForm
    initialValue={floatingIp}
    objId={objId}
    updateQuery={UPDATE_FLOATING_IP}
    action="update"
    backUrl="/ui/openstack/floatingips"
  >
    <TextField id="floating_ip_address" label="Floating IP Address" />
    <TextField id="fixed_ip_address" label="Fixed IP Address" />
    <Button type="submit" variant="raised">Update Floating IP</Button>
  </ValidatedForm>

export default UpdateFloatingIpForm
