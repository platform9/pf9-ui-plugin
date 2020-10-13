import calcUsageTotalByPath from 'k8s/util/calcUsageTotals'

export const calculateNodeUsages = (nodes) => {
  const calcNodesTotals = calcUsageTotalByPath(nodes)
  return {
    compute: calcNodesTotals('usage.compute.current', 'usage.compute.max'),
    memory: calcNodesTotals('usage.memory.current', 'usage.memory.max'),
    disk: calcNodesTotals('usage.disk.current', 'usage.disk.max'),
  }
}
