import TextField from 'core/components/validatedForm/TextField'
import { customValidator } from 'core/utils/fieldValidators'
import React from 'react'

const IPValidator = customValidator((value, formValues) => {
  // validates the octect ranges for an IP
  const IP = `${value}`.split('/')[0]
  if (IP === '0.0.0.0' || IP === '255.255.255.255') {
    return false
  }
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    IP,
  )
}, 'IP invalid, must be between 0.0.0.0 and 255.255.255.255')

const containerAndServicesIPEqualsValidator = customValidator((value, formValues) => {
  const containersIP = `${formValues.containersCidr}`.split('/')[0]
  const servicesIP = `${value}`.split('/')[0]
  return containersIP !== servicesIP
}, 'The services CIDR cannot have the same IP address as the containers CIDR')

const cidrBlockSizeValidator = customValidator((value) => {
  const blockSize = parseInt(`${value}`.split('/')[1])
  return blockSize > 0 && blockSize < 32
}, 'Block Size must be greater than 0 and less than 32')

export default () => (
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
