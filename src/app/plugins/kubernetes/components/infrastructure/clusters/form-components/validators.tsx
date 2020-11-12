import { customValidator } from 'core/utils/fieldValidators'
import IpAddress from 'ip-address'
import { NetworkStackTypes } from './network-stack'

const getIpValidator = (type = NetworkStackTypes.IPv4) =>
  ({
    [NetworkStackTypes.IPv4]: {
      cls: IpAddress.Address4,
      blockSize: [1, 32],
    },
    [NetworkStackTypes.IPv6]: {
      cls: IpAddress.Address6,
      blockSize: [116, 128],
    },
  }[type])

const isValidBlockSize = (size, stack) => {
  const {
    blockSize: [lowerBound, upperBound],
  } = getIpValidator(stack)
  return size >= lowerBound && size <= upperBound
}

const IPValidator = customValidator((value, formValues) => {
  const { cls: IPValidatorCls } = getIpValidator(formValues.networkStack)
  return IPValidatorCls.isValid(value)
}, 'Invalid IP address provided')

const servicesCIDRSubnetValidator = customValidator((value, formValues) => {
  const containersIP = formValues.containersCidr
  const servicesIP = value
  const { cls: IPValidatorCls } = getIpValidator(formValues.networkStack)

  return new IPValidatorCls(containersIP).isInSubnet(servicesIP)
}, 'The services CIDR must be a subnet of the containers CIDR')

const ipv6BlockSizeValidator = customValidator((value) => {
  const blockSize = parseInt(`${value}`.split('/')[1])
  return blockSize >= 116 && blockSize <= 128
}, 'Block Size must be in the range 116 -> 128')

const ipv4BlockSizeValidator = customValidator((value) => {
  const blockSize = parseInt(`${value}`.split('/')[1])
  return blockSize >= 1 && blockSize <= 32
}, 'Block Size must be in the range 1 -> 32')

const calicoBlockSizeCIDRValidator = customValidator((value, formValues) => {
  const blockSize = `${formValues.containersCidr}`.split('/')[1]
  if (!isValidBlockSize(blockSize, formValues.networkStack)) {
    return false
  }
  return value >= blockSize
}, 'Calico Block Size must not conflict with the Container CIDR subnet mask')

export const ipValidators = {
  [NetworkStackTypes.IPv4]: {
    ipValidator: IPValidator,
    servicesCIDRSubnetValidator: servicesCIDRSubnetValidator,
    blockSizeValidator: ipv4BlockSizeValidator,
    calicoBlockSizeCIDRValidator: calicoBlockSizeCIDRValidator,
  },
  [NetworkStackTypes.IPv6]: {
    ipValidator: IPValidator,
    servicesCIDRSubnetValidator: servicesCIDRSubnetValidator,
    blockSizeValidator: ipv6BlockSizeValidator,
    calicoBlockSizeCIDRValidator: calicoBlockSizeCIDRValidator,
  },
}
