import Network from '../Network'

describe('Network', () => {
  beforeEach(() => {
    Network.clearCollection()
  })

  describe('constructor', () => {
    it('creates a network', () => {
      const network = new Network({ name: 'test-network' })
      expect(network).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the Network', () => {
      const network = new Network({ name: 'test-network' })
      expect(network.asJson()).toMatchObject({ name: 'test-network' })
    })
  })
})
