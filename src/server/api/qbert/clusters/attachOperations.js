import context from '../../../context'
import Cluster from '../../../models/qbert/Cluster'
import Node from '../../../models/qbert/Node'
import { attachNodeToCluster, detachNodeFromCluster } from '../../../models/qbert/Operations'

export const attachNodes = (req, res) => {
  const { clusterId } = req.params
  const cluster = Cluster.findById({ id: clusterId, context, raw: true })
  const nodes = req.body
  for (const node of nodes) {
    const _node = Node.findById({ id: node.uuid, context, raw: true })
    attachNodeToCluster(_node, cluster)
  }
  res.status(200).send('ok')
}

export const detachNodes = (req, res) => {
  const { clusterId } = req.params
  const cluster = Cluster.findById({ id: clusterId, context, raw: true })
  const nodes = req.body
  for (const node of nodes) {
    const _node = Node.findById({ id: node.uuid, context, raw: true })
    detachNodeFromCluster(_node, cluster)
  }
  res.status(200).send('ok')
}
