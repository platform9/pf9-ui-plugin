import {
  keystoneEndpoint,
  makeClient,
  getUserPass,
  makeUnscopedClient,
  makeScopedClient
} from '../helpers'

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
      expect(typeof projects[0].name).toEqual('string')
      expect(projects[0].name.length).toBeGreaterThan(0)
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

  describe('regions', () => {
    it('regions', async () => {
      const client = await makeScopedClient()
      const regions = await client.keystone.getRegions()
      expect(regions).toBeDefined()
      expect(regions.length).toBeGreaterThan(0)
    })

    it('set the currently active region', async () => {
      const client = await makeScopedClient()
      const regions = await client.keystone.getRegions()
      client.setActiveRegion(regions[0].id)
      expect(client.activeRegion).toEqual(regions[0].id)
    })
  })

  describe('service catalog', () => {
    it('service catalog', async () => {
      const client = await makeScopedClient()
      const catalog = await client.keystone.getServiceCatalog()
      expect(catalog).toBeDefined()
      expect(catalog.length).toBeGreaterThan(0)
    })

    it('services by region', async () => {
      const client = await makeScopedClient()
      const regions = await client.keystone.getRegions()
      client.setActiveRegion(regions[0].id)
      const services = await client.keystone.getServicesForActiveRegion()
      expect(services).toBeDefined()
      expect(services.keystone.public.url).toBeDefined()
    })

    it('list endpoints', async () => {
      const client = await makeScopedClient()
      const endpoints = await client.keystone.getEndpoints()
      const endpoint = endpoints[0]
      expect(Object.keys(endpoint).includes('region_id', 'region', 'interface', 'service_id')).toBe(true)
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
      const fetchedUser = newUsers.find(x => x.name === 'newUser@domain.com')
      expect(fetchedUser.email).toEqual('newUser@domain.com')
      expect(fetchedUser.displayname).toEqual('New User')
      expect(fetchedUser.id).toEqual(newUser.id)
      await client.keystone.deleteUser(newUser.id)
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
