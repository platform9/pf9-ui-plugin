import NodeWalker from '../NodeWalker'

describe('NodeWalker', () => {
  const workflow = {
    nodes: [
      { id: '1', type: 'start' },
      { id: '2', type: 'activity', action: 'API' },
      { id: '3', type: 'activity', action: 'path', path: 'body.nodes' },
      { id: '4', type: 'activity', action: 'projectAs', mappings: '{"id": "id", "label": "name"}' },
    ],
    wires: [
      { source: '1', dest: '2' },
      { source: '2', dest: '3' },
      { source: '3', dest: '4' },
    ],
  }

  let nodeWalker
  let startNode

  beforeEach(() => {
    nodeWalker = NodeWalker(workflow)
    startNode = nodeWalker.startNode
  })

  describe('executeNode', () => {
    it('should return the nextNodes', () => {
      const result = nodeWalker.executeNode(startNode)
      expect(result.nextNodes).toEqual([workflow.nodes[1]])
    })
  })

  describe('startNode', () => {
    it('finds the start node', () => {
      expect(startNode).toEqual({ id: '1', type: 'start' })
    })

    it('passes the input through to the output', () => {
      const result = nodeWalker.executeNode(startNode, 'foo')
      expect(result.output).toEqual('foo')
    })
  })

  describe('activity: API', () => {
    it('should make an API call', () => {
      const node = nodeWalker.findById('2')
      const result = nodeWalker.executeNode(node, null)
      expect(result.output.status).toEqual(200)
    })
  })

  describe('executeAll', () => {
    it('should walk all the nodes', () => {
      const result = nodeWalker.executeAll('foo')
      expect(result.output).toEqual([{ id: 1, label: 'foo' }])
    })

    it('should execute from the start up to the specified node', () => {
      const terminateAt = nodeWalker.findById('2')
      const result = nodeWalker.executeAll('foo', terminateAt)
      expect(result.output.status).toEqual(200)
    })
  })
})
