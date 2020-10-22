import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

const handleNetworkPluginChange = (option, wizardContext) => {
  const payload = {
    networkPlugin: option,
    privileged: option === 'calico' ? true : wizardContext.privileged,
    calicoIpIpMode: option === 'calico' ? 'Always' : undefined,
    calicoNatOutgoing: option === 'calico' ? true : undefined,
    calicoV4BlockSize: option === 'calico' ? '24' : undefined,
  }
  return payload
}

const NetworkPluginField = ({ networkPluginOptions, wizardContext, setWizardContext }) => (
  <PicklistField
    id="networkPlugin"
    label="Network backend"
    onChange={(value) => setWizardContext(handleNetworkPluginChange(value, wizardContext))}
    options={networkPluginOptions}
    info=""
    required
  />
)

export default NetworkPluginField
