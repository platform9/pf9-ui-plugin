import { partition } from 'ramda'
import { ClusterType, HardwareType, nodeHardwareRequirements } from '../clusters/bareos/constants'

export const hasClockDrift = (node) => node?.message?.warn && node.message.warn[0]

export const isUnauthorizedHost = (host) => !host?.roles?.includes('pf9-kube')

const isPrimaryNetwork = (primaryNetwork) => ([name, ip]) => ip === primaryNetwork

export const orderInterfaces = (
  networkInterfaces: { [key: string]: string },
  primaryNetwork: string,
) => {
  return [].concat(
    ...partition(isPrimaryNetwork(primaryNetwork), Object.entries(networkInterfaces)),
  )
}

export const meetsHardwareRequirement = (
  value,
  clusterType: ClusterType,
  hardwareType: HardwareType,
) => {
  if (!value) return false
  return value >= nodeHardwareRequirements[clusterType][hardwareType]
}
