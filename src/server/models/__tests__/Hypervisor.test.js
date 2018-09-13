import Hypervisor from '../Hypervisor'

describe('Hypervisor', () => {
  beforeEach(() => {
    Hypervisor.clearCollection()
  })

  describe('constructor', () => {
    it('creates a hypervisor', () => {
      const hypervisor = new Hypervisor({ hypervisor_hostname: 'test-hypervisor', host_ip: '10.1.10.150', status: 'enabled' })
      expect(hypervisor).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the Hypervisor', () => {
      const hypervisor = new Hypervisor({ hypervisor_hostname: 'test-hypervisor', host_ip: '10.1.10.150', status: 'enabled' })
      expect(hypervisor.asJson()).toMatchObject({ hypervisor_hostname: 'test-hypervisor', host_ip: '10.1.10.150', status: 'enabled' })
    })
  })
})
