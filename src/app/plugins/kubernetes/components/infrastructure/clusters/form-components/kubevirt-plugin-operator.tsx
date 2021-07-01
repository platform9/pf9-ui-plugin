import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { handleNetworkBackendChange, NetworkBackendTypes } from './network-backend'

const KubevirtPluginOperator = ({ wizardContext, setWizardContext }) => (
  <CheckboxField
    id="deployKubevirt"
    label="Enable KubeVirt"
    info="KubeVirt enables Kubernetes to run Virtual Machines within Pods. This feature is not recommended for production workloads. "
    infoPlacement="right-end"
    value={wizardContext.deployKubevirt}
    onChange={(value) => {
      let changes = {}
      if (value)
        changes = handleNetworkBackendChange(
          NetworkBackendTypes.Calico,
          wizardContext.networkStack,
          wizardContext,
        )
      setWizardContext({
        ...changes,
        deployKubevirt: value,
      })
    }}
  />
)

export default KubevirtPluginOperator
