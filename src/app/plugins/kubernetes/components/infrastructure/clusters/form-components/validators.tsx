import { customValidator } from 'core/utils/fieldValidators'
import * as IpAddress from 'ip-address'
import { NetworkStackTypes } from '../constants'

const getIpValidator = (type = NetworkStackTypes.IPv4) =>
  ({
    [NetworkStackTypes.IPv4]: {
      cls: IpAddress.Address4,
      blockSize: [20, 32],
      subnetMask: [0, 32],
    },
    [NetworkStackTypes.IPv6]: {
      cls: IpAddress.Address6,
      blockSize: [116, 128],
      subnetMask: [0, 128],
    },
  }[type])

const isValidBlockSize = (size, stack) => {
  const {
    blockSize: [lowerBound, upperBound],
  } = getIpValidator(stack)
  return size >= lowerBound && size <= upperBound
}
const isValidSubnetMask = (size, stack) => {
  const {
    subnetMask: [lowerBound, upperBound],
  } = getIpValidator(stack)
  return size >= lowerBound && size <= upperBound
}

const IPValidator = customValidator((value, formValues) => {
  const { cls: IPValidatorCls } = getIpValidator(formValues.networkStack)
  return IPValidatorCls.isValid(value)
}, 'Invalid IP address provided')

const cidrIndependenceValidator = customValidator((value, formValues) => {
  const { cls: IPValidatorCls } = getIpValidator(formValues.networkStack)
  const containersIPInstance = new IPValidatorCls(formValues.containersCidr)
  const servicesIPInstance = new IPValidatorCls(value)

  return (
    servicesIPInstance.isInSubnet(containersIPInstance) === false &&
    containersIPInstance.isInSubnet(servicesIPInstance) === false
  )
}, 'Services CIDR must be an independent subnet of Containers CIDR')

const ipv6BlockSizeValidator = customValidator((value, formValues) => {
  const blockSize = parseInt(value)
  return isValidBlockSize(blockSize, formValues.networkStack)
}, 'Block Size must be in the range 116 -> 128')

const ipv4BlockSizeValidator = customValidator((value, formValues) => {
  const blockSize = parseInt(value)
  return isValidBlockSize(blockSize, formValues.networkStack)
}, 'Block Size must be in the range 20 -> 32')

const ipv6SubnetMaskSizeValidator = customValidator((value, formValues) => {
  const subnetMask = parseInt(`${value}`.split('/')[1])
  return isValidSubnetMask(subnetMask, formValues.networkStack)
}, 'Subnet Mask must be in the range 116 -> 128')

const ipv4SubnetMaskSizeValidator = customValidator((value, formValues) => {
  const subnetMask = parseInt(`${value}`.split('/')[1])
  return isValidSubnetMask(subnetMask, formValues.networkStack)
}, 'Subnet Mask must be in the range 20 -> 32')

const calicoBlockSizeCIDRValidator = customValidator((value, formValues) => {
  const blockSize = parseInt(`${formValues.containersCidr}`.split('/')[1])
  if (!isValidSubnetMask(blockSize, formValues.networkStack)) {
    return false
  }
  return value >= blockSize
}, 'Calico Block Size must not conflict with the Container CIDR subnet mask')

export const ipValidators = {
  [NetworkStackTypes.IPv4]: {
    cidrIndependenceValidator,
    calicoBlockSizeCIDRValidator,
    subnetMaskSizeValidator: ipv4SubnetMaskSizeValidator,
    ipValidator: IPValidator,
    blockSizeValidator: ipv4BlockSizeValidator,
  },
  [NetworkStackTypes.IPv6]: {
    cidrIndependenceValidator,
    calicoBlockSizeCIDRValidator,
    subnetMaskSizeValidator: ipv6SubnetMaskSizeValidator,
    ipValidator: IPValidator,
    blockSizeValidator: ipv6BlockSizeValidator,
  },
}
