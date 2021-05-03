import ApiClient from 'api-client/ApiClient'

require('isomorphic-fetch')

const config = require('../../config')
const registry = require('../../src/app/utils/registry')

const { keystone } = ApiClient.getInstance()
const { getUnscopedToken, getScopedProjects } = keystone

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

    describe('display dashboard elements', () => {
      it('display the dashboard title', async () => {
        const tenants = await getScopedProjects()
        expect(tenants.length).toBeGreaterThan(0)
      })

      // it('show a list of cards', async () => {
      //   const tenants = await getScopedProjects()
      //   expect(tenants.length).toBeGreaterThan(0)
      // })
    })
  })
})
