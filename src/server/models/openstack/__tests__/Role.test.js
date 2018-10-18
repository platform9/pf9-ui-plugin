import Role from '../Role'

describe('Role', () => {
  beforeEach(() => {
    Role.clearCollection()
  })

  describe('constructor', () => {
    it('creates a role', () => {
      const role = new Role({ name: 'admin', description: 'An admin user', displayName: 'Admin User' })
      expect(role).toBeDefined()
      expect(role instanceof Role).toBe(true)
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the Role', () => {
      const role = new Role({ name: 'admin', description: 'An admin user', displayName: 'Admin User' })
      const json = role.asJson()
      expect(Object.keys(json)).toEqual(['id', 'name', 'description', 'displayName'])
    })

    it('creates a blank role as a placeholder', () => {
      const role = new Role()
      expect(role).toBeDefined()
    })
  })
})
