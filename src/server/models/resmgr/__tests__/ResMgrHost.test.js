import ResMgrHost from '../ResMgrHost'

describe('ResMgrHost', () => {
  beforeEach(() => {
    ResMgrHost.clearCollection()
  })

  new ResMgrHost({ roles: ['pf9-ostackhost'], info: { hostname: 'fake resmgr host' } })

  describe('constructor', () => {
    it('creates a ResMgrHost', () => {
      const resMgrHost = new ResMgrHost({ roles: ['pf9-ostackhost'], info: { hostname: 'test-resmgrhost' } })
      expect(resMgrHost).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the ResMgrHost', () => {
      const resMgrHost = new ResMgrHost({ roles: ['pf9-ostackhost'], info: { hostname: 'test-resmgrhost' } })
      expect(resMgrHost.asJson()).toMatchObject({ roles: ['pf9-ostackhost'], info: { hostname: 'test-resmgrhost' } })
    })
  })
})
