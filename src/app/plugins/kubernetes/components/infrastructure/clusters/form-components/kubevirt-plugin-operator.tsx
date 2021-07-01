import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

const KubevirtPluginOperator = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id="deployKubevirt"
    label="Enable KubeVirt"
    info="KubeVirt enables Kubernetes to run Virtual Machines within Pods. This feature is not recommended for production workloads. "
    infoPlacement="right-end"
    value={wizardContext.deployKubevirt}
    onChange={(value) => {
      setWizardContext({
        deployKubevirt: value,
      })
    }}
  />
)

export default KubevirtPluginOperator
