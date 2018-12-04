import context from '../../../context'
import Node from '../../../models/qbert/Node'

const getNodes = (req, res) => {
  const nodes = Node.list(context)
  return res.send(nodes)
}

export default getNodes
