import React from 'react'
import TextField from 'core/components/validatedForm/TextField'

export default ({
  setWizardContext,
  id = 'name',
  label = 'Name',
  info = 'Name of the cluster',
  onChange = (value) => setWizardContext({ name: value }),
  required = true,
}) => <TextField id={id} label={label} info={info} onChange={onChange} required={required} />
