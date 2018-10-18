import Token from '../Token'
import User from '../User'

const UUID_STRING_LENGTH = 36

describe('Token', () => {
  beforeEach(() => {
    Token.clearCollection()
  })

  describe('constructor', () => {
    it('creates a token', () => {
      const token = new Token()
      expect(token).toBeDefined()
    })

    it('extracts roles from the user object', () => {
      const user = new User({ username: 'admin@platform9.com' })
      const token = new Token({ user })
      expect(token.user).toBeDefined()
      expect(token.roles instanceof Array).toBe(true)
    })
  })

  it('has an id by default', () => {
    const token = new Token()
    expect(token.id.length).toBe(UUID_STRING_LENGTH)
  })

  it('add itself to a collection', () => {
    const t1 = new Token()
    const t2 = new Token()
    expect(Token.getCollection().length).toBe(2)
    expect(Token.findById(t1.id)).toBeDefined()
    expect(Token.findById(t2.id)).toBeDefined()
  })

  it('clearCollection', () => {
    const t1 = new Token() // eslint-disable-line no-unused-vars
    expect(Token.getCollection().length).toBe(1)
    Token.clearCollection()
    expect(Token.getCollection().length).toBe(0)
  })

  it('destroy', () => {
    const t1 = new Token() // eslint-disable-line no-unused-vars
    expect(Token.getCollection().length).toBe(1)
    t1.destroy()
    expect(Token.getCollection().length).toBe(0)
  })

  it('validateToken', () => {
    const token = new Token()
    const tokenId = token.id
    expect(Token.validateToken(tokenId)).toMatchObject({ id: tokenId })
    token.destroy()
    expect(Token.validateToken(tokenId)).toBe(null)
  })

  describe('asJson', () => {
    it('creates a JSON version of the Token', () => {
      const token = new Token()
      const json = token.asJson()
      expect(Object.keys(json)).toEqual(['id', 'project', 'roles', 'user'])
    })
  })
})
