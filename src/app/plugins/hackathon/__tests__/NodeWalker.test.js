import NodeWalker from '../NodeWalker'

describe('NodeWalker', () => {
  const workflow = {
    nodes: [
      { id: '1', type: 'start' },
      { id: '2', type: 'activity', action: 'API' },
    ],
    wires: [
      { source: '1', dest: '2' },
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
      expect(result.output.response.status).toEqual(200)
    })
  })

  describe('executeAll', () => {
    it('should walk all the nodes', () => {
      const result = nodeWalker.executeAll('foo')
      expect(result.output.response.status).toEqual(200)
    })
  })
})
