import React from 'react'
import { Button } from '@material-ui/core'
import ValidatedForm from 'core/common/ValidatedForm'
import TextField from 'core/common/TextField'

const AddSshKeyForm = ({ onComplete }) =>
  <ValidatedForm
    backUrl="/ui/openstack/sshkeys"
    onSubmit={onComplete}
  >
    <TextField id="name" label="Name" />
    <TextField id="public_key" label="Public Key" />
    <Button type="submit" variant="raised">Add SSH Key</Button>
  </ValidatedForm>

export default AddSshKeyForm
