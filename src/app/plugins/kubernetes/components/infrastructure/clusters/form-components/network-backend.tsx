import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { CalicoDetectionTypes } from './calico-network-fields'
import { NetworkStackTypes } from '../constants'

export enum NetworkBackendTypes {
  Flannel = 'flannel',
  Calico = 'calico',
}

const networkBackendOptions = [
  { label: 'Flannel', value: NetworkBackendTypes.Flannel },
  { label: 'Calico', value: NetworkBackendTypes.Calico },
  // { label: 'Canal (experimental)', value: 'canal' },
]

export const handleNetworkBackendChange = (option, stack, wizardContext) => {
  return {
    networkPlugin: option,
    privileged: option === 'calico' ? true : wizardContext.privileged,
    calicoIpIpMode: option === 'calico' ? 'Always' : undefined,
    calicoNatOutgoing: option === 'calico' ? true : undefined,
    calicoBlockSize: option === 'calico' && stack === NetworkStackTypes.IPv6 ? '122' : option === 'calico' ? '26' : undefined,
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
    info={
      wizardContext.networkStack !== NetworkStackTypes.IPv6 ? 'IPV6 only supports Calico CNI' : ''
    }
    disabled={wizardContext.networkStack !== NetworkStackTypes.IPv4}
    required
  />
)

export default NetworkBackendField
