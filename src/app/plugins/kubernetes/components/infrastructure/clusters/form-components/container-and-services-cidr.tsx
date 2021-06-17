import TextField from 'core/components/validatedForm/TextField'
import React from 'react'
import { NetworkStackTypes } from '../constants'
import { ipValidators } from './validators'

const cidrTooltipByNetworkStack = {
  [NetworkStackTypes.IPv6]:
    'Calico only supports a subnet mask greater than /116 . Please make sure the CIDR specified is between /116 -> /128.',
  [NetworkStackTypes.IPv4]:
    "Network CIDR from which Kubernetes allocates IP addresses to containers. This CIDR shouldn't overlap with the VPC CIDR. A /16 CIDR enables 256 nodes.",
}

const ContainerAndServicesCIDRField = ({ values }) => (
  <>
    {/* Containers CIDR */}
    <TextField
      id="containersCidr"
      label="Containers CIDR"
      info={cidrTooltipByNetworkStack?.[values.networkStack]}
      required
      validations={[
        ipValidators?.[values.networkStack]?.ipValidator,
        ipValidators?.[values.networkStack]?.subnetMaskSizeValidator,
      ]}
    />

    {/* Services CIDR */}
    <TextField
      id="servicesCidr"
      label="Services CIDR"
      info="The network CIDR for Kubernetes virtual IP addresses for Services. This CIDR shouldn't overlap with the VPC CIDR."
      required
      validations={[
        ipValidators?.[values.networkStack]?.ipValidator,
        ipValidators?.[values.networkStack]?.cidrIndependenceValidator,
        ipValidators?.[values.networkStack]?.subnetMaskSizeValidator,
      ]}
    />
  </>
)

export default ContainerAndServicesCIDRField
