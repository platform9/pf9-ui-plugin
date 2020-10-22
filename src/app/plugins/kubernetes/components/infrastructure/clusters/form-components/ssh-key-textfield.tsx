import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

export default ({ validations, required = true }) => (
  <TextField
    id="sshKey"
    label="Public SSH key"
    info="Copy/paste your SSH public key"
    size="small"
    validations={validations}
    multiline
    rows={3}
    required={required}
  />
)
