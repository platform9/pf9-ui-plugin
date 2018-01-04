import React from 'react'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'

const AddSshKeyForm = ({ onComplete }) =>
  <ValidatedForm
    backUrl="/ui/openstack/sshkeys"
    onSubmit={onComplete}
  >
    <TextField id="name" label="Name" />
    <TextField id="public_key" label="Public Key" />
    <SubmitButton>Add SSH Key</SubmitButton>
  </ValidatedForm>

export default AddSshKeyForm
