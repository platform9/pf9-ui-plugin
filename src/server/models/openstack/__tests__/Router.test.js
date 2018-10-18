import Router from '../Router'

describe('Router', () => {
  beforeEach(() => {
    Router.clearCollection()
  })

  describe('constructor', () => {
    it('creates a router', () => {
      const router = new Router({ name: 'Test router 1', tenant_id: 'abc123', admin_state_up: false, status: 'ACTIVE' })
      expect(router).toBeDefined()
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the Router', () => {
      const router = new Router({ name: 'Test router 2', tenant_id: 'abc123', admin_state_up: true, status: 'ACTIVE' })
      expect(router.asJson()).toMatchObject({ name: 'Test router 2', tenant_id: 'abc123', admin_state_up: true, status: 'ACTIVE' })
    })
  })
})
