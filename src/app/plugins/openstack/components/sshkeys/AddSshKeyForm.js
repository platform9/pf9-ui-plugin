import React from 'react'
import SubmitButton from 'core/common/SubmitButton'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import TextField from 'core/common/validated_form/TextField'

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
