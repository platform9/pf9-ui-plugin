import RadioFields from 'core/components/validatedForm/radio-fields'
import React from 'react'
import { NetworkBackendTypes, handleNetworkBackendChange } from './network-backend'

export enum NetworkStackTypes {
  IPv4 = 'ipv4',
  IPv6 = 'ipv6',
  // DualStack = 'dualstack',
}

const networkStackOptions = [
  { label: 'IPv4', value: NetworkStackTypes.IPv4 },
  { label: 'IPv6', value: NetworkStackTypes.IPv6 },
  // { label: 'DualStack', value: NetworkStackTypes.DualStack },
]

const formKey = 'networkStack'

export const handleNetworkStackChange = (changeValue, wizardContext) => {
  return {
    networkStack: changeValue,
    calicoIPv4: changeValue === NetworkStackTypes.IPv4 ? 'autodetect' : 'none',
    calicoIPv6: changeValue === NetworkStackTypes.IPv6 ? 'autodetect' : 'none',
    ...handleNetworkBackendChange(
      changeValue === NetworkStackTypes.IPv4
        ? wizardContext.networkPlugin
        : NetworkBackendTypes.Calico,
      wizardContext,
    ),
  }
}

export default function NetworkStackChooser({ wizardContext, setWizardContext }) {
  return (
    <RadioFields
      id={formKey}
      value={wizardContext[formKey]}
      options={networkStackOptions}
      onChange={(changeValue) =>
        setWizardContext(handleNetworkStackChange(changeValue, wizardContext))
      }
    />
  )
}
