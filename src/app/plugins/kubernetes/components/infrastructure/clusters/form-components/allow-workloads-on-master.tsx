import CheckboxField from 'core/components/validatedForm/CheckboxField'
import React from 'react'

export default ({ wizardContext, disabled = false }) => (
  <CheckboxField
    id="allowWorkloadsOnMaster"
    value={wizardContext.allowWorkloadsOnMaster}
    label="Enable workloads on all master nodes"
    info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
    disabled={disabled}
  />
)
