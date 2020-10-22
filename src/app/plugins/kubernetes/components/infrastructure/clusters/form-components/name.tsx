import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

export default ({ setWizardContext }) => (
  <TextField
    id="name"
    label="Name"
    info="Name of the cluster"
    onChange={(value) => setWizardContext({ name: value })}
    required
  />
)
