import Instance from '../Instance'

describe('Instance', () => {
  beforeEach(() => {
    Instance.clearCollection()
  })

  describe('constructor', () => {
    it('creates a instance', () => {
      const instance = new Instance({ name: 'Test Instance 1', status: 'ACTIVE', state: 'active' })
      expect(instance).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the instance', () => {
      const instance = new Instance({ name: 'Test Instance 2', status: 'ACTIVE', state: 'active' })
      expect(instance.asJson()).toMatchObject({ name: 'Test Instance 2', status: 'ACTIVE', 'OS-EXT-STS:vm_state': 'active' })
    })
  })
})
