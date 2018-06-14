import Flavor from '../Flavor'

describe('Flavor', () => {
  beforeEach(() => {
    Flavor.clearCollection()
  })

  describe('constructor', () => {
    it('creates a flavor', () => {
      const flavor = new Flavor({ name: 'test-flavor', ram: 1024, disk: 10, vcpus: 1 })
      expect(flavor).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the Flavor', () => {
      const flavor = new Flavor({ name: 'test-flavor', ram: 1024, disk: 10, vcpus: 1, tags: '{key:value}' })
      expect(flavor.asJson()).toMatchObject({ name: 'test-flavor', ram: 1024, disk: 10, vcpus: 1, tags: '{key:value}' })
    })
  })
})
