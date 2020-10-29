import TextField from 'core/components/validatedForm/TextField'
import React from 'react'
import {
  cidrBlockSizeValidator,
  containerAndServicesIPEqualsValidator,
  IPValidator,
} from './validators'

const ContainerAndServicesCIDRField = () => (
  <>
    {/* Containers CIDR */}
    <TextField
      id="containersCidr"
      label="Containers CIDR"
      info="Network CIDR from which Kubernetes allocates IP addresses to containers. This CIDR shouldn't overlap with the VPC CIDR. A /16 CIDR enables 256 nodes."
      required
      validations={[IPValidator, cidrBlockSizeValidator]}
    />

    {/* Services CIDR */}
    <TextField
      id="servicesCidr"
      label="Services CIDR"
      info="The network CIDR for Kubernetes virtual IP addresses for Services. This CIDR shouldn't overlap with the VPC CIDR."
      required
      validations={[IPValidator, containerAndServicesIPEqualsValidator, cidrBlockSizeValidator]}
    />
  </>
)

export default ContainerAndServicesCIDRField
