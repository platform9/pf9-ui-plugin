import {
  ConnectionStatus,
  HealthStatus,
  IClusterSelector,
  IClusterStatus,
  TransientStatus,
} from './model'
import { INodesSelector } from 'k8s/components/infrastructure/nodes/model'
import { routes } from 'core/utils/routes'

interface INodeCount {
  total: number
  healthy: number
}

interface ConnectionStatusFields {
  message: string
  clusterStatus: IClusterStatus
  label: string
}

interface HealthStatusFields {
  status: IClusterStatus
  label: string
}

interface HealthStatusAndMessage {
  mastersHealthStatus: HealthStatus
  workersHealthStatus: HealthStatus
  healthStatus: HealthStatus
  getMessage: (masters: INodeCount, workers: INodeCount) => string
}

const nodeStatusOkOrFailed = (node: INodesSelector): boolean =>
  node.status === 'ok' || node.status === 'failed'

export function getConnectionStatus(
  taskStatus: string,
  nodes: INodesSelector[],
): ConnectionStatus | TransientStatus {
  if (isTransientStatus(taskStatus)) {
    return taskStatus as TransientStatus
  }

  if (!nodes.length) return 'disconnected'

  if (hasConvergingNodes(nodes)) {
    return 'converging'
  }

  if (nodes.every(nodeStatusOkOrFailed)) {
    return 'connected'
  }

  if (nodes.find(nodeStatusOkOrFailed)) {
    return 'partially_connected'
  }

  return 'disconnected'
}

export const connectionStatusFieldsTable: {
  [status in ConnectionStatus | 'converging']: ConnectionStatusFields
} = {
  connected: {
    message: 'All nodes in the cluster are connected to Platform9 management plane.',
    clusterStatus: 'ok',
    label: 'Connected',
  },
  disconnected: {
    message: 'All nodes in the cluster are disconnected from Platform9 management plane.',
    clusterStatus: 'fail',
    label: 'Disconnected',
  },
  partially_connected: {
    message: 'Some nodes in the cluster are not connected to Platform9 management plane.',
    clusterStatus: 'pause',
    label: 'Partially Connected',
  },
  converging: {
    message: '',
    clusterStatus: 'loading',
    label: 'Converging',
  },
}

export function getMasterNodesHealthStatus(
  masterNodes: INodesSelector[] = [],
  healthyMasterNodes: INodesSelector[] = [],
): HealthStatus | TransientStatus {
  if (hasConvergingNodes(masterNodes)) {
    return 'converging'
  }

  const healthyMasterNodesCount = healthyMasterNodes.length
  const mastersQuorumNumber = masterNodes.length // TODO: how to get quorum number of masters?
  return getNodesHealthStatus(healthyMasterNodesCount, masterNodes.length, mastersQuorumNumber)
}

export function getWorkerNodesHealthStatus(
  workerNodes: INodesSelector[] = [],
  healthyWorkerNodes: INodesSelector[] = [],
): HealthStatus | TransientStatus {
  if (hasConvergingNodes(workerNodes)) {
    return 'converging'
  }

  const healthyWorkersNodesCount = healthyWorkerNodes.length
  const workersQuorumNumber = Math.ceil(workerNodes.length / 2)
  return getNodesHealthStatus(healthyWorkersNodesCount, workerNodes.length, workersQuorumNumber)
}

const findClusterHealthValues = (masterStatus, workerStatus) =>
  clusterHealthStatusAndMessageTable.find(
    (item) =>
      item.mastersHealthStatus === masterStatus && item.workersHealthStatus === workerStatus,
  )

export function getHealthStatus(
  connectionStatus: ConnectionStatus | TransientStatus,
  masterStatus: HealthStatus | TransientStatus,
  workerStatus: HealthStatus | TransientStatus,
  canUpgrade,
) {
  if (connectionStatus === 'disconnected') {
    return 'unknown'
  }

  if (isTransientStatus(connectionStatus)) {
    return connectionStatus as TransientStatus
  }

  if (canUpgrade) {
    return 'needs_upgrade'
  }

  const healthStatusAndMessage = findClusterHealthValues(masterStatus, workerStatus)

  return healthStatusAndMessage.healthStatus
}

export function getHealthStatusMessage(cluster: IClusterSelector): string {
  const {
    masterNodesHealthStatus,
    workerNodesHealthStatus,
    workerNodes,
    masterNodes,
    healthyMasterNodes,
    healthyWorkerNodes,
  } = cluster
  const healthStatusAndMessage = findClusterHealthValues(
    masterNodesHealthStatus,
    workerNodesHealthStatus,
  )
  const masterCounts = { total: masterNodes.length, healthy: healthyMasterNodes.length }
  const workerCounts = { total: workerNodes.length, healthy: healthyWorkerNodes.length }

  if (!healthStatusAndMessage) {
    return ''
  }
  return healthStatusAndMessage.getMessage(masterCounts, workerCounts)
}

function getNodesHealthStatus(
  healthyCount: number,
  count: number,
  threshold: number,
): HealthStatus {
  if (healthyCount === count) {
    return 'healthy'
  }

  if (healthyCount >= threshold) {
    return 'partially_healthy'
  }

  return 'unhealthy'
}

const getFormattedCounts = (masterNodes, workerNodes) => ({
  masterCount: masterNodes.total || '',
  unhealthyWorkers: workerNodes.total - workerNodes.healthy,
  unhealthyMasters: masterNodes.total - masterNodes.healthy,
  percentUnhealthyWorkers: Math.floor(
    (workerNodes.total / (workerNodes.total - workerNodes.healthy)) * 100,
  ),
})

function getUnhealthyWorkerMessage(masterNodes, workerNodes) {
  const { unhealthyWorkers, percentUnhealthyWorkers } = getFormattedCounts(masterNodes, workerNodes)
  return workerNodes.total > 0
    ? `${unhealthyWorkers} out of ${workerNodes.total} (${percentUnhealthyWorkers}%) workers are unhealthy`
    : `cluster has no worker nodes`
}
function getHealthyWorkerMessage(masterNodes, workerNodes) {
  return workerNodes.total > 0
    ? `all ${workerNodes.total} workers are healthy`
    : `cluster has no worker nodes`
}

const clusterHealthStatusAndMessageTable: HealthStatusAndMessage[] = [
  {
    mastersHealthStatus: 'healthy',
    workersHealthStatus: 'healthy',
    healthStatus: 'healthy',
    getMessage: (masterNodes, workerNodes) => {
      const masterCount = masterNodes.total || ''
      const workerMessage = getHealthyWorkerMessage(masterNodes, workerNodes)
      return `All ${masterCount} masters are healthy, ${workerMessage}`.replace(/\s+/g, ' ')
    },
  },
  {
    mastersHealthStatus: 'healthy',
    workersHealthStatus: 'partially_healthy',
    healthStatus: 'healthy',
    getMessage: (masterNodes, workerNodes) => {
      const { masterCount } = getFormattedCounts(masterNodes, workerNodes)
      const workerMessage = getUnhealthyWorkerMessage(masterNodes, workerNodes)
      return `All ${masterCount} masters are healthy, ${workerMessage}`
    },
  },
  {
    mastersHealthStatus: 'healthy',
    workersHealthStatus: 'unhealthy',
    healthStatus: 'unhealthy',
    getMessage: (masterNodes, workerNodes) => {
      const { masterCount } = getFormattedCounts(masterNodes, workerNodes)
      const workerMessage = getUnhealthyWorkerMessage(masterNodes, workerNodes)
      return `All ${masterCount} masters are healthy, ${workerMessage}`
    },
  },
  {
    mastersHealthStatus: 'partially_healthy',
    workersHealthStatus: 'healthy',
    healthStatus: 'partially_healthy',
    getMessage: (masterNodes, workerNodes) => {
      const { masterCount, unhealthyMasters } = getFormattedCounts(masterNodes, workerNodes)
      const masterMessage = `${unhealthyMasters} out of ${masterCount} masters are unhealthy (Quorum still established)`
      const workerMessage = getHealthyWorkerMessage(masterNodes, workerNodes)
      return `${masterMessage}, ${workerMessage}`
    },
  },
  {
    mastersHealthStatus: 'partially_healthy',
    workersHealthStatus: 'partially_healthy',
    healthStatus: 'partially_healthy',
    getMessage: (masterNodes, workerNodes) => {
      const { masterCount, unhealthyMasters } = getFormattedCounts(masterNodes, workerNodes)
      const masterMessage = `${unhealthyMasters} out of ${masterCount} masters are unhealthy (Quorum still established)`
      const workerMessage = getUnhealthyWorkerMessage(masterNodes, workerNodes)
      return `${masterMessage}, ${workerMessage}`
    },
  },
  {
    mastersHealthStatus: 'partially_healthy',
    workersHealthStatus: 'unhealthy',
    healthStatus: 'unhealthy',
    getMessage: (masterNodes, workerNodes) => {
      const { masterCount, unhealthyMasters } = getFormattedCounts(masterNodes, workerNodes)
      const masterMessage = `${unhealthyMasters} out of ${masterCount} masters are unhealthy (Quorum still established)`
      const workerMessage = getUnhealthyWorkerMessage(masterNodes, workerNodes)
      return `${masterMessage}, ${workerMessage}`
    },
  },
  {
    mastersHealthStatus: 'unhealthy',
    workersHealthStatus: 'healthy',
    healthStatus: 'unhealthy',
    getMessage: (masterNodes, workerNodes) => {
      const { masterCount, unhealthyMasters } = getFormattedCounts(masterNodes, workerNodes)
      const masterMessage = `${unhealthyMasters} out of ${masterCount} masters are unhealthy (Quorum still established)`
      const workerMessage = getHealthyWorkerMessage(masterNodes, workerNodes)
      return `${masterMessage}, ${workerMessage}`
    },
  },
  {
    mastersHealthStatus: 'unhealthy',
    workersHealthStatus: 'partially_healthy',
    healthStatus: 'unhealthy',
    getMessage: (masterNodes, workerNodes) => {
      const { masterCount, unhealthyMasters } = getFormattedCounts(masterNodes, workerNodes)
      const masterMessage = `${unhealthyMasters} out of ${masterCount} masters are unhealthy (Quorum failed)`
      const workerMessage = getUnhealthyWorkerMessage(masterNodes, workerNodes)
      return `${masterMessage}, ${workerMessage}`
    },
  },
  {
    mastersHealthStatus: 'unhealthy',
    workersHealthStatus: 'unhealthy',
    healthStatus: 'unhealthy',
    getMessage: (masterNodes, workerNodes) => {
      const { masterCount, unhealthyMasters } = getFormattedCounts(masterNodes, workerNodes)
      const masterMessage = `${unhealthyMasters} out of ${masterCount} masters are unhealthy (Quorum failed)`
      const workerMessage = getUnhealthyWorkerMessage(masterNodes, workerNodes)
      return `${masterMessage}, ${workerMessage}`
    },
  },
]

export const hasConvergingNodes = (nodes: INodesSelector[]): boolean =>
  !!nodes.find((node) => node.status === 'converging')

export const isSteadyState = (taskStatus: string, nodes: INodesSelector[]): boolean =>
  !hasConvergingNodes(nodes) && ['success', 'error'].includes(taskStatus)

export const isHealthyStatus = (status: string): boolean =>
  ['healthy', 'needs_upgrade'].includes(status)

export const isUnhealthyStatus = (status: string): boolean =>
  ['unhealthy', 'unknown'].includes(status)

export const isTransientStatus = (status: string): boolean =>
  ['creating', 'deleting', 'updating', 'upgrading', 'converging'].includes(status)

export const clusterHealthStatusFields: {
  [status in HealthStatus | 'converging']: HealthStatusFields
} = {
  healthy: {
    status: 'ok',
    label: 'Healthy',
  },
  partially_healthy: {
    status: 'pause',
    label: 'Partially healthy',
  },
  unhealthy: {
    status: 'fail',
    label: 'Unhealthy',
  },
  unknown: {
    status: 'unknown',
    label: 'Unknown',
  },
  converging: {
    status: 'loading',
    label: 'Converging',
  },
  needs_upgrade: {
    status: 'upgrade',
    label: 'Upgrade Available',
  },
}

interface ClusterHealthStatusFields extends HealthStatusFields {
  message: string
  nodesDetailsUrl: string
}

export const getClusterHealthStatus = (cluster: IClusterSelector) => {
  if (
    !cluster.healthStatus ||
    !cluster.masterNodesHealthStatus ||
    !cluster.workerNodesHealthStatus
  ) {
    return null
  }
  const fields: ClusterHealthStatusFields = clusterHealthStatusFields[cluster.healthStatus]
  fields.message = getHealthStatusMessage(cluster)
  fields.nodesDetailsUrl = routes.cluster.nodeHealth.path({ id: cluster.uuid })
  return fields
}

export const getClusterConnectionStatus = (cluster: IClusterSelector) => {
  if (!cluster.connectionStatus) {
    return null
  }
  const fields: ConnectionStatusFields & { nodesDetailsUrl: string } =
    connectionStatusFieldsTable[cluster.connectionStatus]
  fields.nodesDetailsUrl = routes.cluster.nodeHealth.path({ id: cluster.uuid })
  return fields
}
