import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import { customValidator } from 'core/utils/fieldValidators'
import { isKeyValid } from 'ssh-pub-key-validation'

const sshKeyValidator = customValidator((value) => {
  return isKeyValid(value)
}, 'You must enter a valid SSH key')

export default ({ validations = [sshKeyValidator] }) => (
  <TextField
    id="sshKey"
    label="Public SSH key"
    info="Copy/paste your SSH public key"
    size="small"
    // validations={validations}
    multiline
    rows={3}
    required
  />
)
