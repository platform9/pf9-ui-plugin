const healthy = 'healthy'
const partiallyHealthy = 'partially_healthy'
const unhealthy = 'unhealthy'

const nodeStatusOkOrFailed = (node) => node.status === 'ok' || node.status === 'failed'

export const getConnectionStatus = (nodes) => {
  if (nodes.every(nodeStatusOkOrFailed)) {
    return 'connected'
  }

  if (nodes.find(nodeStatusOkOrFailed)) {
    return 'partially_connected'
  }

  return 'disconnected'
}

export const connectionStatusFields = {
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

export const getHealthStatusAndMessage = (healthyMasterNodes = [], nodes = [], numMasters, numWorkers) => {
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

const getNodesHealthStatus = (healthyCount, count, threshold) => {
  if (healthyCount === count) {
    return healthy
  }

  if (healthyCount >= threshold) {
    return partiallyHealthy
  }

  return unhealthy
}

const clusterHealthStatusAndMessageTable = [
  {
    mastersHealthStatus: healthy,
    workersHealthStatus: healthy,
    healthStatus: healthy,
    message: 'All masters and all workers are healthy',
  },
  {
    mastersHealthStatus: healthy,
    workersHealthStatus: partiallyHealthy,
    healthStatus: healthy,
    message: 'All masters are healthy, majority of workers (> 50%) are healthy',
  },
  {
    mastersHealthStatus: healthy,
    workersHealthStatus: unhealthy,
    healthStatus: unhealthy,
    message: 'All masters are healthy but majority of workers (> 50%) are unhealthy',
  },
  {
    mastersHealthStatus: partiallyHealthy,
    workersHealthStatus: healthy,
    healthStatus: partiallyHealthy,
    message: 'Quorum number of masters are healthy, all workers are healthy',
  },
  {
    mastersHealthStatus: partiallyHealthy,
    workersHealthStatus: partiallyHealthy,
    healthStatus: partiallyHealthy,
    message: 'Quorum number of masters are healthy, majority of workers (>50%) are healthy',
  },
  {
    mastersHealthStatus: partiallyHealthy,
    workersHealthStatus: unhealthy,
    healthStatus: unhealthy,
    message: 'Quorum number of masters are healthy but majority of workers (> 50%) are unhealthy',
  },
  {
    mastersHealthStatus: unhealthy,
    workersHealthStatus: healthy,
    healthStatus: unhealthy,
    message: 'Less than quorum number of masters are healthy, all workers are healthy',
  },
  {
    mastersHealthStatus: unhealthy,
    workersHealthStatus: partiallyHealthy,
    healthStatus: unhealthy,
    message: 'Less than quorum number of masters are healthy, majority of workers (>50%) are healthy',
  },
  {
    mastersHealthStatus: unhealthy,
    workersHealthStatus: unhealthy,
    healthStatus: unhealthy,
    message: 'Less than quorum number of masters are healthy, and majority of workers (>50%) are unhealthy',
  },
]

export const isConverging = (nodes) => !!nodes.find(node => node.status === 'converging')

export const isSteadyState = (taskStatus, nodes) =>
  !isConverging(nodes) && ['success', 'error'].includes(taskStatus)

export const isTransientState = (taskStatus, nodes) =>
  ['creating', 'deleting', 'updating', 'upgrading'].includes(taskStatus) || isConverging(nodes)

export const clusterHealthStatusFields = {
  [healthy]: {
    status: 'ok',
    label: 'Healthy',
  },
  [partiallyHealthy]: {
    status: 'pause',
    label: 'Partially healthy',
  },
  [unhealthy]: {
    status: 'fail',
    label: 'Unhealthy',
  },
}
