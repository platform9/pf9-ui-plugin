import React from 'react'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import { customValidator } from 'core/utils/fieldValidators'

const calicoIpIPHelpText = {
  Always: 'Encapsulates POD traffic in IP-in-IP between nodes.',
  CrossSubnet:
    'Encapsulation when nodes span subnets and cross routers that may drop native POD traffic, this is not required between nodes with L2 connectivity.',
  Never: 'Disables IP in IP Encapsulation.',
}

const calicoBlockSizeValidator = customValidator((value, formValues) => {
  const blockSize = `${formValues.containersCidr}`.split('/')[1]
  return value > 20 && value < 32 && value > blockSize
}, 'Calico Block Size must be greater than 20, less than 32 and not conflict with the Container CIDR')

const calicoIpIpOptions = [
  { label: 'Always', value: 'Always' },
  { label: 'Cross Subnet', value: 'CrossSubnet' },
  { label: 'Never', value: 'Never' },
]

const CalicoNetworkFields = ({ wizardContext, setWizardContext }) => (
  <>
    <PicklistField
      id="calicoIpIpMode"
      value={wizardContext.calicoIpIpMode}
      label="IP in IP Encapsulation Mode"
      onChange={(value) => setWizardContext({ calicoIpIpMode: value })}
      options={calicoIpIpOptions}
      info={calicoIpIPHelpText[wizardContext.calicoIpIpMode] || ''}
      required
    />
    <CheckboxField
      id="calicoNatOutgoing"
      value={wizardContext.calicoNatOutgoing}
      onChange={(value) => setWizardContext({ calicoNatOutgoing: value })}
      label="NAT Outgoing"
      info="Packets destined outside the POD network will be SNAT'd using the node's IP."
    />
    <TextField
      id="calicoV4BlockSize"
      value={wizardContext.calicoV4BlockSize}
      label="Block Size"
      onChange={(value) => setWizardContext({ calicoV4BlockSize: value })}
      info="Block size determines how many Pod's can run per node vs total number of nodes per cluster. Example /22 enables 1024 IPs per node, and a maximum of 64 nodes. Block size must be greater than 20 and less than 32 and not conflict with the Contain CIDR"
      required
      validations={[calicoBlockSizeValidator]}
    />
    <TextField
      id="mtuSize"
      label="MTU Size"
      info="Maximum Transmission Unit (MTU) for the interface (in bytes)"
      required
    />
  </>
)

export default CalicoNetworkFields
