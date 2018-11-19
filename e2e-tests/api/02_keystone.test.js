require('isomorphic-fetch')

const config = require('../../config')
const registry = require('../../src/app/utils/registry')

const keystone = require('../../src/app/plugins/openstack/api/keystone')
const {
  getUnscopedToken,
  getScopedProjects,
} = keystone

describe('keystone', () => {
  beforeAll(() => {
    registry.setupFromConfig(config)
  })

  describe('getUnscopedToken', () => {
    it('it returns the correct token', async () => {
      const { username, password } = registry.getInstance()
      const token = await getUnscopedToken(username, password)
      expect(token.length).toBeGreaterThan(5)
    })

    it('it returns null when there is an invalid login', async () => {
      const { username } = registry.getInstance()
      const password = 'bad-password'
      const token = await getUnscopedToken(username, password)
      expect(token).toBeNull()
    })
  })

  describe('when authenticated', () => {
    beforeAll(async () => {
      const { username, password } = registry.getInstance()
      const token = await getUnscopedToken(username, password)
      registry.setItem('token', token)
    })

    describe('getScopedProjects', () => {
      it('gets a list of tenants', async () => {
        const tenants = await getScopedProjects()
        expect(tenants.length).toBeGreaterThan(0)
      })
    })
  })
})
