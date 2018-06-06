import {
  jestMockResponse,
  lastCall,
} from '../../util/testUtils'

import {
  constructPasswordMethod,
  constructTokenBody,
  getRegions,
  getScopedProjects,
  getScopedToken,
  getUnscopedToken,
} from '../keystone'

import * as registry from '../../../../util/registry'

let originalFetch = global.fetch

describe('keystone api', () => {
  beforeEach(() => {
    global.fetch = require('jest-fetch-mock')
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  describe('constructors', () => {
    it('constructTokenBody', () => {
      const tokenConstructor = constructTokenBody('token')
      expect(tokenConstructor('secretUnscopedToken', 'serviceTenantId')).toEqual({
        auth: {
          identity: {
            methods: ['token'],
            token: { id: 'secretUnscopedToken' },
          },
          scope: { project: { id: 'serviceTenantId' } }
        }
      })
    })

    it('constructPasswordMethod', () => {
      const result = constructPasswordMethod('pf9@platform9.com', 'secret')
      expect(result).toEqual({
        user: {
          name: 'pf9@platform9.com',
          domain: { id: 'default' },
          password: 'secret'
        }
      })
    })
  })

  describe('getUnscopedToken', () => {
    it('uses the username and password in the request', async () => {
      const mockedFetch = jestMockResponse()
      global.fetch = mockedFetch
      await getUnscopedToken('pf9@platform9.com', 'secret')
      const [ url, params ] = lastCall(mockedFetch)
      const body = JSON.parse(params.body)
      expect(url).toEqual('/keystone/v3/auth/tokens?nocatalog')
      expect(body.auth.identity.password.user).toMatchObject({ name: 'pf9@platform9.com', password: 'secret' })
    })

    it('returns the X-Subject-Token when the password is correct', async () => {
      global.fetch = jestMockResponse({ headers: { 'X-Subject-Token': 'secretToken' } })
      const unscopedToken = await getUnscopedToken('pf9@platform9.com', 'secret')
      expect(unscopedToken).toEqual('secretToken')
    })

    it('returns the X-Subject-Token to be null when the password is bad', async () => {
      global.fetch = jestMockResponse({ headers: {} })
      const unscopedToken = await getUnscopedToken('pf9@platform9.com', 'badPassword')
      expect(unscopedToken).toBeFalsy()
    })
  })

  describe('getScopedProjects', () => {
    let mockedFetch
    const mockedTenants = [
      { id: 'abc123', name: 'serviceTenantId', description: 'Service tenant' }
    ]

    beforeEach(() => {
      registry.setItem('token', 'secretUnscopedToken')
      mockedFetch = jestMockResponse({ projects: mockedTenants })
      global.fetch = mockedFetch
    })

    it('uses the unscopedToken', async () => {
      await getScopedProjects()
      expect(mockedFetch).toHaveBeenCalledWith(
        '/keystone/v3/auth/projects',
        {
          method: 'GET',
          headers: { 'X-Auth-Token': 'secretUnscopedToken' }
        }
      )
    })

    it('returns the projects', async () => {
      const tenants = await getScopedProjects()
      expect(tenants).toEqual(mockedTenants)
    })
  })

  describe('getScopedToken', () => {
    let mockedFetch
    const mockScopedTokenResponseBody = {
      auth: {
        identity: {
          methods: ['token'],
          token: { id: 'secretScopedToken' }
        },
        scope: {
          project: { id: 'abc123' }
        }
      }
    }

    beforeEach(() => {
      registry.setItem('token', 'secretUnscopedToken')
      mockedFetch = jestMockResponse({
        ...mockScopedTokenResponseBody,
        headers: { 'x-subject-token': 'secretScopedToken' }
      })
      global.fetch = mockedFetch
    })

    it('uses the existing unscopedToken to get a token scoped to a tenant', async () => {
      await getScopedToken('serviceTenantId')
      const params = mockedFetch.mock.calls[0][1]
      const requestBody = JSON.parse(params.body)
      expect(requestBody.auth.identity.token.id).toEqual('secretUnscopedToken')
    })

    it('returns a different X-Subject-Token that is scoped to a tenant', async () => {
      const response = await getScopedToken('serviceTenantId')
      expect(response).toEqual({ scopedToken: 'secretScopedToken' })
    })
  })

  describe('getRegions', () => {
    let mockedFetch
    beforeEach(() => {
      registry.setItem('token', 'secretScopedToken')
      mockedFetch = jestMockResponse({ regions: [] })
      global.fetch = mockedFetch
    })

    it('should be authenticated', async () => {
      await getRegions()
      expect(lastCall(mockedFetch)[1].headers['X-Auth-Token']).toEqual('secretScopedToken')
    })

    it('should hit the regions endpoint', async () => {
      await getRegions()
      expect(lastCall(mockedFetch)[0]).toEqual('/keystone/v3/regions')
    })
  })
})
