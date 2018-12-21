import { pathOr } from 'ramda'

const sumPath = (path, nodes) => (nodes || []).reduce(
  (accum, node) => {
    return accum + pathOr(0, path.split('.'), node)
  },
  0
)

// The cluster resource utilization is the aggregate of all nodes in the cluster.
// This calculation happens every render.  It's not ideal but it isn't that expensive
// so we can probably leave it here.
const clusterUsageStats = (cluster, context) => {
  const nodeIds = cluster.nodes.map(x => x.uuid)
  const combinedNodes = context.combinedHosts
    .filter(x => nodeIds.includes(x.resmgr.id))
  let clusterWithStats = {
    ...cluster,
    usage: {
      compute: {
        current: sumPath('usage.compute.current', combinedNodes),
        max: sumPath('usage.compute.max', combinedNodes),
        units: 'GHz',
        type: 'used',
      },
      memory: {
        current: sumPath('usage.memory.current', combinedNodes),
        max: sumPath('usage.memory.max', combinedNodes),
        units: 'GiB',
        type: 'used',
      },
      disk: {
        current: sumPath('usage.disk.current', combinedNodes),
        max: sumPath('usage.disk.max', combinedNodes),
        units: 'GiB',
        type: 'used',
      }
    }
  }

  const { compute, memory, disk } = clusterWithStats.usage
  clusterWithStats.usage.compute.percent = Math.round(100 * compute.current / (compute.max || 1))
  clusterWithStats.usage.memory.percent = Math.round(100 * memory.current / (memory.max || 1))
  clusterWithStats.usage.disk.percent = Math.round(100 * disk.current / (disk.max || 1))

  return clusterWithStats
}

export default clusterUsageStats
