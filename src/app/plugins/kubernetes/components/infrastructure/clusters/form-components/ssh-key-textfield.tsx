import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import { customValidator } from 'core/utils/fieldValidators'
import { isKeyValid } from 'ssh-pub-key-validation'

const sshKeyValidator = customValidator((value) => {
  return isKeyValid(value)
}, 'You must enter a valid SSH key')

export default ({
  wizardContext,
  setWizardContext,
  validations = [sshKeyValidator],
  required = true,
}) => (
  <TextField
    id="sshKey"
    value={wizardContext.sshKey}
    onChange={(value) => setWizardContext({ sshKey: value })}
    label="Public SSH key"
    info="Copy/paste your SSH public key"
    size="small"
    validations={wizardContext.sshKey || required ? validations : []}
    multiline
    rows={3}
    required={required}
  />
)
