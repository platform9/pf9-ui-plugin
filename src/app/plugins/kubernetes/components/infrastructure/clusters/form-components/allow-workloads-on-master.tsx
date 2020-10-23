import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

export default () => (
  <CheckboxField
    id="allowWorkloadsOnMaster"
    label="Enable workloads on all master nodes"
    info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
  />
)
