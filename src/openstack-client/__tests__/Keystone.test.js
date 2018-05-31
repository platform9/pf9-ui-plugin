import config from '../../../config'

import OpenstackClient from '../OpenstackClient'

const keystoneEndpoint = 'http://localhost:4444/keystone'
const makeClient = () => new OpenstackClient({ keystoneEndpoint })

const getUserPass = () => {
  const { username, password } = config
  if (!username || !password) {
    throw new Error('username and/or password not specified in config.js')
  }
  return { username, password }
}

const makeUnscopedClient = async () => {
  const { username, password } = getUserPass()
  const client = makeClient()
  await client.keystone.authenticate(username, password)
  return client
}

describe('Keystone', () => {
  let client

  describe('authentication', () => {
    beforeEach(() => {
      client = makeClient()
    })
    it('access the endpoint locally', () => {
      expect(client.keystone.endpoint).toEqual(keystoneEndpoint)
    })

    it('authenticate with invalid password fails', async () => {
      const token = await client.keystone.authenticate('badUser', 'badPassword')
      expect(token).toBeNull()
    })

    it('authenticate with correct credentials returns unscoped token', async () => {
      const { username, password } = getUserPass()
      const token = await client.keystone.authenticate(username, password)
      expect(token).toBeDefined()
    })

    it('remembers the unscoped token in the client instance', async () => {
      const { username, password } = getUserPass()
      const token = await client.keystone.authenticate(username, password)
      expect(client.unscopedToken).toEqual(token)
    })

    it('includes the unscoped token in the serialization', async () => {
      const { username, password } = getUserPass()
      const token = await client.keystone.authenticate(username, password)
      expect(client.serialize().unscopedToken).toEqual(token)
    })
  })

  describe('scoping', () => {
    it('scope the client to a project', async () => {
      await makeUnscopedClient()
      // todo
    })
  })
})
