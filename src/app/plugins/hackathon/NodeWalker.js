import { propEq } from 'ramda'

const NodeWalker = workflow => {
  const { nodes, wires } = workflow

  // This context will act as a local variable "scope" for the executing workflow
  let context = {}

  const findById = id => nodes.find(propEq('id', id))
  const startNode = nodes.find(node => node.type === 'start')
  const findConnectedNodes = node => wires.filter(propEq('source', node.id)).map(x => findById(x.dest))

  // Single steps through a node execution
  const executeNode = (node, input) => {
    if (node.type === 'start') {
      return { input, context, output: input, nextNodes: findConnectedNodes(node) }
    }

    if (node.type === 'activity') {
      const { action } = node
      if (action === 'API') {
        // TODO: Make actual API call
        const response = { status: 200, body: 'hello world' }
        // TODO: memoize result in editor
        return { input, context, output: { response }, nextNodes: findConnectedNodes(node) }
      }
    }
  }

  // Executes all nodes in the workflow from the startNode until it ends
  const executeAll = input => {
    let _execute = (node, input) => {
      console.log('_execute', JSON.stringify({ node, input }))
      const result = executeNode(node, input)
      const { nextNodes, output } = result
      if (nextNodes.length === 0) { return result }
      // Right now we don't have any branching or conditionals so we can
      // simplify with just executing the next node directly.
      return _execute(nextNodes[0], output)
    }

    return _execute(startNode, input)
  }

  return {
    startNode,
    findById,
    executeNode,
    executeAll,
  }
}

export default NodeWalker
