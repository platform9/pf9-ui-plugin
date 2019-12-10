type HealthStatus = 'healthy' | 'partially_healthy' | 'unhealthy' | 'unknown'
type ConnectionStatus = 'connected' | 'partially_connected' | 'disconnected'

interface Node {
  status: 'ok' | 'failed' | 'converging'
  isMaster: boolean
}

interface ConnectionStatusFields {
  message: string
  clusterStatus: string
  label: string
}

interface HealthStatusFields {
  status: string
  label: string
}

interface HealthStatusAndMessage {
  mastersHealthStatus: HealthStatus
  workersHealthStatus: HealthStatus
  healthStatus: HealthStatus
  message: string
}

const nodeStatusOkOrFailed = (node: Node): boolean => node.status === 'ok' || node.status === 'failed'

export function getConnectionStatus (nodes: Node[]): ConnectionStatus {
  if (nodes.every(nodeStatusOkOrFailed)) {
    return 'connected'
  }

  if (nodes.find(nodeStatusOkOrFailed)) {
    return 'partially_connected'
  }

  return 'disconnected'
}

export const connectionStatusFieldsTable: {[status in ConnectionStatus]: ConnectionStatusFields} = {
  connected: {
    message: 'All nodes in the cluster are conected to Platform9 management plane.',
    clusterStatus: 'ok',
    label: 'Connected',
  },
  disconnected: {
    message: 'All nodes in the cluster are disconected from Platform9 management plane.',
    clusterStatus: 'fail',
    label: 'Disconnected',
  },
  partially_connected: {
    message: 'Some nodes in the cluster are not connected to Platform9 management plane.',
    clusterStatus: 'pause',
    label: 'Partially Connected',
  },
}

export function getHealthStatusAndMessage (
  healthyMasterNodes = [],
  nodes: Node[] = [],
  numMasters: number,
  numWorkers: number,
): [HealthStatus, string] {
  const connectionStatus = getConnectionStatus(nodes)

  if (connectionStatus === 'disconnected') {
    return ['unknown', 'Cluster is disconnected']
  }

  const healthyMasterNodesCount = healthyMasterNodes.length
  const healthyWorkersNodesCount = nodes.filter(node => !node.isMaster && node.status === 'ok').length
  const mastersQuorumNumber = numMasters // TODO: how to get quorum number of masters?
  const workersQuorumNumber = Math.ceil(numWorkers/2)
  const mastersHealthStatus = getNodesHealthStatus(healthyMasterNodesCount, numMasters, mastersQuorumNumber)
  const workersHealthStatus = getNodesHealthStatus(healthyWorkersNodesCount, numWorkers, workersQuorumNumber)
  const healthStatusAndMessage = clusterHealthStatusAndMessageTable.find(item =>
    item.mastersHealthStatus === mastersHealthStatus &&
    item.workersHealthStatus === workersHealthStatus
  )

  return [healthStatusAndMessage.healthStatus, healthStatusAndMessage.message]
}

function getNodesHealthStatus (healthyCount: number, count: number, threshold: number): HealthStatus {
  if (healthyCount === count) {
    return 'healthy'
  }

  if (healthyCount >= threshold) {
    return 'partially_healthy'
  }

  return 'unhealthy'
}

const clusterHealthStatusAndMessageTable: HealthStatusAndMessage[] = [
  {
    mastersHealthStatus: 'healthy',
    workersHealthStatus: 'healthy',
    healthStatus: 'healthy',
    message: 'All masters and all workers are healthy',
  },
  {
    mastersHealthStatus: 'healthy',
    workersHealthStatus: 'partially_healthy',
    healthStatus: 'healthy',
    message: 'All masters are healthy, majority of workers (> 50%) are healthy',
  },
  {
    mastersHealthStatus: 'healthy',
    workersHealthStatus: 'unhealthy',
    healthStatus: 'unhealthy',
    message: 'All masters are healthy but majority of workers (> 50%) are unhealthy',
  },
  {
    mastersHealthStatus: 'partially_healthy',
    workersHealthStatus: 'healthy',
    healthStatus: 'partially_healthy',
    message: 'Quorum number of masters are healthy, all workers are healthy',
  },
  {
    mastersHealthStatus: 'partially_healthy',
    workersHealthStatus: 'partially_healthy',
    healthStatus: 'partially_healthy',
    message: 'Quorum number of masters are healthy, majority of workers (>50%) are healthy',
  },
  {
    mastersHealthStatus: 'partially_healthy',
    workersHealthStatus: 'unhealthy',
    healthStatus: 'unhealthy',
    message: 'Quorum number of masters are healthy but majority of workers (> 50%) are unhealthy',
  },
  {
    mastersHealthStatus: 'unhealthy',
    workersHealthStatus: 'healthy',
    healthStatus: 'unhealthy',
    message: 'Less than quorum number of masters are healthy, all workers are healthy',
  },
  {
    mastersHealthStatus: 'unhealthy',
    workersHealthStatus: 'partially_healthy',
    healthStatus: 'unhealthy',
    message: 'Less than quorum number of masters are healthy, majority of workers (>50%) are healthy',
  },
  {
    mastersHealthStatus: 'unhealthy',
    workersHealthStatus: 'unhealthy',
    healthStatus: 'unhealthy',
    message: 'Less than quorum number of masters are healthy, and majority of workers (>50%) are unhealthy',
  },
]

export const hasConvergingNodes = (nodes: Node[]): boolean => !!nodes.find(node => node.status === 'converging')

export const isSteadyState = (taskStatus: string, nodes: Node[]): boolean =>
  !hasConvergingNodes(nodes) && ['success', 'error'].includes(taskStatus)

export const isTransientState = (taskStatus: string, nodes: Node[]): boolean =>
  ['creating', 'deleting', 'updating', 'upgrading', 'converging'].includes(taskStatus) || hasConvergingNodes(nodes)

export const clusterHealthStatusFields: {[status in HealthStatus]: HealthStatusFields} = {
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
    status: 'pause',
    label: 'Unknown'
  },
}
