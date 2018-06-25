import Network from '../Network'

describe('Network', () => {
  beforeEach(() => {
    Network.clearCollection()
  })

  describe('constructor', () => {
    it('creates a network', () => {
      const network = new Network({ name: 'Test network 1', subnets: '10.10.0.0/1', tenant: 'Dev Tenant', shared: false, port_security_enabled: true, external: true, admin_state_up: false, status: 'ACTIVE' })
      expect(network).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the Network', () => {
      const network = new Network({ name: 'Test network 2', subnets: '10.10.0.0/2', tenant: 'Test Tenant', shared: true, port_security_enabled: false, external: true, admin_state_up: true, status: 'ACTIVE' })
      expect(network.asJson()).toMatchObject({ name: 'Test network 2', subnets: '10.10.0.0/2', tenant: 'Test Tenant', shared: true, port_security_enabled: false, external: true, admin_state_up: true, status: 'ACTIVE' })
    })
  })
})
