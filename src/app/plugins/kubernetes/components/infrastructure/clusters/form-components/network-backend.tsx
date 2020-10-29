import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'

export enum NetworkBackendTypes {
  Flannel = 'flannel',
  Calico = 'calico',
}

const networkBackendOptions = [
  { label: 'Flannel', value: NetworkBackendTypes.Flannel },
  { label: 'Calico', value: NetworkBackendTypes.Calico },
  // { label: 'Canal (experimental)', value: 'canal' },
]

const handleNetworkBackendChange = (option, wizardContext) => {
  const payload = {
    networkPlugin: option,
    privileged: option === 'calico' ? true : wizardContext.privileged,
    calicoIpIpMode: option === 'calico' ? 'Always' : undefined,
    calicoNatOutgoing: option === 'calico' ? true : undefined,
    calicoV4BlockSize: option === 'calico' ? '24' : undefined,
  }
  return payload
}

const NetworkBackendField = ({
  options = networkBackendOptions,
  wizardContext,
  setWizardContext,
}) => (
  <PicklistField
    id="networkPlugin"
    label="Network backend"
    onChange={(value) => setWizardContext(handleNetworkBackendChange(value, wizardContext))}
    options={options}
    info=""
    required
  />
)

export default NetworkBackendField
