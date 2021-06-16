import { partition, pathOr } from 'ramda'
import { ClusterType, HardwareType, nodeHardwareRequirements } from '../clusters/bareos/constants'
import {
  ApiServerHealthStatus,
  ApiServerHealthStatusFields,
  ErrorMessageCodes,
  errorMessageLevel,
} from './model'

export const getErrorMessage = (node, msgLevel: errorMessageLevel, code: ErrorMessageCodes) => {
  const messages = pathOr(null, ['message', msgLevel], node)
  if (!messages || !Array.isArray(messages)) return null

  return messages.find((msg) => msg.code === code)?.message
}

export const hasClockDrift = (node) => !!getErrorMessage(node, 'warn', ErrorMessageCodes.timeDrift)

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

/**
 * Checks whether or not any node in the nodes array have clock drift
 * @param nodes Array of nodes
 * @returns True if clock drift is detected in any of the nodes. False if none of the nodes have clock drift
 */
export const clockDriftDetectedInNodes = (nodes) => {
  return nodes && !!nodes.find((node) => hasClockDrift(node))
}

export const nodeApiServerHealthStatusFields: {
  [status in ApiServerHealthStatus]: ApiServerHealthStatusFields
} = {
  online: {
    label: 'Online',
    message: 'API server is responding on this node',
    status: 'online',
  },
  offline: {
    label: 'Offline',
    message: 'API server is not responding on this node',
    status: 'offline',
  },
}
