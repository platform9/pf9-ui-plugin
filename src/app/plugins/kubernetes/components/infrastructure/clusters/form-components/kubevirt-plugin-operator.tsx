import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'

const KubevirtPluginOperator = () => (
  <CheckboxField
    id="deployKubevirt"
    label="Enable Kubevirt"
    info="KubeVirt enables Kubernetes to run Virtual Machines within Pods. This feature is not recommended for production workloads. "
    infoPlacement="right-end"
  />
)

export default KubevirtPluginOperator
