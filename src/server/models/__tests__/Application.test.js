import Application from '../Application'

describe('Application', () => {
  beforeEach(() => {
    Application.clearCollection()
  })

  describe('constructor', () => {
    it('creates an application', () => {
      const application = new Application({ name: 'test-application', author: 'admin', public: true, tenant: 'test tenant', description: 'some descriptions' })
      expect(application).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the Flavor', () => {
      const application = new Application({ name: 'test-application1', author: 'admin', public: true, tenant: 'test tenant', description: 'some descriptions' })
      expect(application.asJson()).toMatchObject({ name: 'test-application1', author: 'admin', public: true, tenant: 'test tenant', description: 'some descriptions' })
    })
  })
})
