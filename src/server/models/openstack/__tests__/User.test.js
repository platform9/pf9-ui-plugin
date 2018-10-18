import Role from '../Role'
import User from '../User'

describe('User', () => {
  beforeEach(() => {
    User.clearCollection()
  })

  describe('constructor', () => {
    it('creates a user', () => {
      const user = new User({ username: 'admin@platform9.com' })
      expect(user).toBeDefined()
    })
  })

  describe('addRole', () => {
    it('allows roles to be added to the user', () => {
      const adminRole = new Role({ name: 'admin' })
      const memberRole = new Role({ name: '_member_' })
      const user = new User({ username: 'admin@platform9.com' })
      expect(user.roles).toEqual([])
      user.addRole(adminRole)
      user.addRole(memberRole)
      expect(user.roles.length).toBe(2)
    })
  })

  describe('asJson', () => {
    it('creates a JSON version of the User', () => {
      const user = new User({ username: 'admin@platform9.com' })
      expect(user.asJson()).toMatchObject({ username: 'admin@platform9.com' })
    })

    it('should exclude the password from the JSON output', () => {
      const user = new User({ username: 'admin@platform9.com', password: 'secret' })
      const json = user.asJson()
      expect(Object.keys(json).includes('password')).toBe(false)
    })
  })

  describe('getAuthenticatedUser', () => {
    it('fails authentication if the user does not exist', () => {
      const noUser = User.getAuthenticatedUser('imaginary', 'user')
      expect(noUser).toBe(null)
    })

    it('fails authentication when the password is incorrect', () => {
      new User({ username: 'admin@platform9.com', password: 'secret' })
      const failedUser = User.getAuthenticatedUser('admin@platform9.com', 'bad-password')
      expect(failedUser).toBe(null)
    })

    it('returns the user when the username and password are correct', () => {
      new User({ username: 'admin@platform9.com', password: 'secret' })
      const fetchedUser = User.getAuthenticatedUser('admin@platform9.com', 'secret')
      expect(fetchedUser instanceof User).toBe(true)
      expect(fetchedUser.username).toBe('admin@platform9.com')
    })
  })
})
