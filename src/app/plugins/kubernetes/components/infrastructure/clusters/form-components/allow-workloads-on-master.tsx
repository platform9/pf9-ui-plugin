import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

const AllowWorkloadsOnMaster = ({ disabled = false, setWizardContext }) => (
  <CheckboxField
    id="allowWorkloadsOnMaster"
    label="Enable workloads on all master nodes"
    info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
    onChange={(value) => setWizardContext({ allowWorkloadsOnMaster: value })} // need to set the wizard context so the wizard can know if you can finish and review or not
    disabled={disabled}
  />
)

export default AllowWorkloadsOnMaster
