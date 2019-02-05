import { path, propEq } from 'ramda'
import { projectAs } from 'utils/fp'

const NodeWalker = workflow => {
  const { nodes, wires } = workflow

  // This context will act as a local variable "scope" for the executing workflow
  let context = {}

  const findById = id => nodes.find(propEq('id', id))
  const startNode = nodes.find(node => node.type === 'start')
  const findConnectedNodes = node => wires.filter(propEq('source', node.id)).map(x => findById(x.dest))

  // Single steps through a node execution
  const executeNode = (node, input) => {
    const nextNodes = findConnectedNodes(node)

    if (node.type === 'start') {
      return { input, context, output: input, nextNodes }
    }

    if (node.type === 'activity') {
      const { action } = node
      if (action === 'API') {
        // TODO: Make actual API call
        const response = { status: 200, body: { nodes: [ { id: 1, name: 'foo' } ] } }
        // TODO: memoize result in editor
        return { input, context, output: response, nextNodes }
      }

      if (action === 'path') {
        const output = node.path && node.path.length > 0
          ? path(node.path.split('.'), input)
          : input
        const response = { input, context, output, nextNodes }
        return response
      }

      if (action === 'projectAs') {
        try {
          const mappings = JSON.parse(node.mappings)
          const response = { input, context, nextNodes, output: projectAs(mappings, input) }
          return response
        } catch (err) {
          console.log(err)
          return { input, context, nextNodes, output: input }
        }
      }

      return { input, context, output: input, nextNodes }
    }
  }

  // Executes all nodes in the workflow from the startNode until it ends
  const executeAll = (input, terminateAt=null) => {
    let _execute = (node, input) => {
      // console.log('_execute', JSON.stringify({ node, input }))
      const result = executeNode(node, input)
      const { nextNodes, output } = result
      const [nextNode] = nextNodes
      if (!nextNode) { return result }
      if (terminateAt && node.id === terminateAt.id) { return result }
      // Right now we don't have any branching or conditionals so we can
      // simplify with just executing the next node directly.
      return _execute(nextNode, output)
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
