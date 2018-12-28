export const attachNodeToCluster = (node, cluster) => {
  node.clusterUuid = cluster.uuid
  node.clusterName = cluster.name
  cluster.nodes.push(node)
}

export const detachNodeFromCluster = (node, cluster) => {
  node.clusterUuid = null
  node.clusterName = null
  cluster.nodes = cluster.nodes.filter((n) => (n.uuid !== node.uuid))
}
