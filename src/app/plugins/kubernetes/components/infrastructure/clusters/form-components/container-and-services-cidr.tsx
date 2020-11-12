import TextField from 'core/components/validatedForm/TextField'
import React from 'react'
import { ipValidators } from './validators'

const ContainerAndServicesCIDRField = ({ values }) => (
  <>
    {/* Containers CIDR */}
    <TextField
      id="containersCidr"
      label="Containers CIDR"
      info="Network CIDR from which Kubernetes allocates IP addresses to containers. This CIDR shouldn't overlap with the VPC CIDR. A /16 CIDR enables 256 nodes."
      required
      validations={[
        ipValidators?.[values.networkStack]?.ipValidator,
        ipValidators?.[values.networkStack]?.blockSizeValidator,
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
        ipValidators?.[values.networkStack]?.servicesCIDRSubnetValidator,
        ipValidators?.[values.networkStack]?.blockSizeValidator,
      ]}
    />
  </>
)

export default ContainerAndServicesCIDRField
