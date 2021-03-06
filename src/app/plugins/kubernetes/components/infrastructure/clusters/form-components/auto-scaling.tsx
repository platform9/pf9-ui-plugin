import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import TextField from 'core/components/validatedForm/TextField'
import React from 'react'

const AutoScalingField = () => (
  <CheckboxField
    id="enableCAS"
    label="Enable Auto Scaling"
    info="The cluster may scale up to the max worker nodes specified. Auto scaling may not be used with spot instances."
  />
)

export const AutoScalingAddonFields = () => (
  <FormFieldCard title="Auto Scaling">
    <TextField
      id="numMaxWorkers"
      type="number"
      label="Maximum number of worker nodes"
      info="Maximum number of worker nodes this cluster may be scaled up to."
    />
  </FormFieldCard>
)

export default AutoScalingField
