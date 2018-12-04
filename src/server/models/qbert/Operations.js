export const attachNodeToCluster = (node, cluster) => {
  node.clusterUuid = cluster.uuid
  node.clusterName = cluster.name
  cluster.nodes.push(node)
}
