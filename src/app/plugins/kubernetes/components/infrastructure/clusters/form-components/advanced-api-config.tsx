import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'

const runtimeConfigOptions = [
  { label: 'Default API groups and versions', value: 'default' },
  { label: 'All API groups and versions', value: 'all' },
  { label: 'Custom', value: 'custom' },
]

export default ({ values, required = true }) => (
  <>
    <PicklistField
      id="runtimeConfigOption"
      label="Advanced API Configuration"
      options={runtimeConfigOptions}
      info="Make sure you are familiar with the Kubernetes API configuration documentation before enabling this option."
      required={required}
    />

    {values.runtimeConfigOption === 'custom' && (
      <TextField id="customRuntimeConfig" label="Custom API Configuration" info="" />
    )}
  </>
)
