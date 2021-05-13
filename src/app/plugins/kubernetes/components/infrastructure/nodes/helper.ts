export const isUnauthorizedHost = (host) => !host?.roles?.includes('pf9-kube')

export const clockDriftErrorMessage = 'Cannot attach node(s) with clock drift'

/**
 *
 * @param nodeUuids Array of node uuids
 * @param allNodes Array of all nodes
 * @returns True if clock drift is detected in any of the nodes. False if none of the nodes have clock drift
 */
export const checkNodesForClockDrift = (nodeUuids: String[], allNodes) => {
  for (const uuid of nodeUuids) {
    const node = allNodes.find((node) => node.uuid === uuid)
    const hasClockDrift = node?.message && node.message.warn && node.message.warn[0]
    if (hasClockDrift) {
      return true
    }
  }
  return false
}
