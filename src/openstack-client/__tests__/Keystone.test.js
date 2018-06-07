import config from '../../../config'

import OpenstackClient from '../OpenstackClient'

const keystoneEndpoint = 'http://localhost:4444/keystone'
const makeClient = () => new OpenstackClient({ keystoneEndpoint })

const getUserPass = () => {
  const { username, password } = config.simulator
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
    it('get a list of projects', async () => {
      const client = await makeUnscopedClient()
      const projects = await client.keystone.getProjects()
      expect(projects).toBeDefined()
      expect(projects.length).toBeGreaterThan(0)
      expect(projects[0].name).toEqual('service')
    })

    it('scope the client to a project', async () => {
      const client = await makeUnscopedClient()
      const projects = await client.keystone.getProjects()
      const projectId = projects[0].id
      const scopedToken = await client.keystone.changeProjectScope(projectId)
      expect(scopedToken).toBeDefined()
      expect(client.scopedToken).toBeDefined()
      expect(client.scopedToken).toEqual(scopedToken)
      expect(client.scopedToken).not.toEqual(client.unscopedToken)
    })
  })
})
