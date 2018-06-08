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

const makeScopedClient = async () => {
  const client = await makeUnscopedClient()
  const projects = await client.keystone.getProjects()
  await client.keystone.changeProjectScope(projects[0].id)
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

  describe('misc simple endpoints', () => {
    // TODO: this is not implemented in the simulator yet so we can't test it
    it.skip('service catalog', async () => {
      const client = await makeScopedClient()
      const catalog = await client.keystone.getServiceCatalog()
      expect(catalog).toBeDefined()
      expect(catalog.length).toBeGreaterThan(0)
    })

    it('regions', async () => {
      const client = await makeScopedClient()
      const regions = await client.keystone.getRegions()
      expect(regions).toBeDefined()
      expect(regions.length).toBeGreaterThan(0)
    })
  })

  describe('users', () => {
    it('list users', async () => {
      const client = await makeScopedClient()
      const users = await client.keystone.getUsers()
      expect(users).toBeDefined()
      expect(users.length).toBeGreaterThan(0)
    })

    it('create a user', async () => {
      const client = await makeScopedClient()
      const users = await client.keystone.getUsers()
      const newUser = await client.keystone.createUser({
        name: 'newUser@domain.com',
        email: 'newUser@domain.com',
        username: 'newUser@domain.com',
        password: 'secret',
        displayname: 'New User' // yes, it's lowercase in keystone
      })
      expect(newUser).toBeDefined()
      expect(newUser.id).toBeDefined()
      const newUsers = await client.keystone.getUsers()
      expect(newUsers.length - 1).toEqual(users.length)
      const lastUser = newUsers[newUsers.length - 1]
      expect(lastUser.email).toEqual('newUser@domain.com')
      expect(lastUser.displayname).toEqual('New User')
      expect(lastUser.id).toEqual(newUser.id)
    })

    it('delete a user', async () => {
      const client = await makeScopedClient()
      const userToDelete = await client.keystone.createUser({
        name: 'deleteMe@domain.com',
        email: 'deleteMe@domain.com',
        username: 'deleteMe@domain.com',
        password: 'secret',
        displayname: 'Delete me' // yes, it's lowercase in keystone
      })
      const users = await client.keystone.getUsers()
      await client.keystone.deleteUser(userToDelete.id)
      const refreshedUsers = await client.keystone.getUsers()
      expect(refreshedUsers.length).toEqual(users.length - 1)
    })

    it('delete a non-existant user', async () => {
      const client = await makeScopedClient()
      try {
        await client.keystone.deleteUser('invalidId')
      } catch (err) {
        expect(err.toString()).toMatch('Unable to delete non-existant user')
      }
    })
  })
})
