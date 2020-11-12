import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { NetworkStackTypes } from './network-stack'
import { CalicoDetectionTypes } from './calico-network-fields'

export enum NetworkBackendTypes {
  Flannel = 'flannel',
  Calico = 'calico',
}

const networkBackendOptions = [
  { label: 'Flannel', value: NetworkBackendTypes.Flannel },
  { label: 'Calico', value: NetworkBackendTypes.Calico },
  // { label: 'Canal (experimental)', value: 'canal' },
]

export const handleNetworkBackendChange = (option, wizardContext) => {
  return {
    networkPlugin: option,
    privileged: option === 'calico' ? true : wizardContext.privileged,
    calicoIpIpMode: option === 'calico' ? 'Always' : undefined,
    calicoNatOutgoing: option === 'calico' ? true : undefined,
    calicoV4BlockSize: option === 'calico' ? '24' : undefined,
    calicoDetectionMethod: option === 'calico' ? CalicoDetectionTypes.FirstFound : undefined,
  }
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
    disabled={wizardContext.networkStack !== NetworkStackTypes.IPv4}
    required
  />
)

export default NetworkBackendField
