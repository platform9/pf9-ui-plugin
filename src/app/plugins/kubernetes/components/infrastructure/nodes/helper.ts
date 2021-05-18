export const isUnauthorizedHost = (host) => !host?.roles?.includes('pf9-kube')

export const hasClockDrift = (node) => node?.message?.warn && node.message.warn[0]

/**
 * Checks whether or not any node in the nodes array have clock drift
 * @param nodes Array of nodes
 * @returns True if clock drift is detected in any of the nodes. False if none of the nodes have clock drift
 */
export const clockDriftDetectedInNodes = (nodes) => {
  return nodes && !!nodes.find((node) => hasClockDrift(node))
}
