import axios from 'axios'
import { pluck } from 'ramda'
import { getHighestRole } from './helpers'

const authConstructors = {
  password: (username, password) => ({
    user: {
      name: username,
      domain: { id: 'default' },
      password
    }
  }),

  token: token => ({ id: token })
}

const constructAuthBody = (method, ...args) => {
  const body = {
    auth: {
      identity: {
        methods: [method],
        [method]: authConstructors[method](...args)
      },
    }
  }

  return body
}

const groupByRegion = catalog => {
  let regions = {}
  catalog.forEach(service => {
    const { name } = service
    service.endpoints.forEach(endpoint => {
      const { region } = endpoint
      regions[region] = regions[region] || {}
      regions[region][name] = regions[region][name] || {}
      regions[region][name][endpoint.interface] = {
        id: endpoint.id,
        url: endpoint.url,
        type: service.type,
        iface: endpoint.interface,
      }
    })
  })
  return regions
}

class Keystone {
  constructor (client) {
    this.client = client
  }

  get endpoint () { return this.client.options.keystoneEndpoint }
  get v3 () { return `${this.endpoint}/v3` }

  get catalogUrl () { return `${this.v3}/auth/catalog` }
  get projectsAuthUrl () { return `${this.v3}/auth/projects` }
  get endpointsUrl () { return `${this.v3}/endpoints` }
  get regionsUrl () { return `${this.v3}/regions` }
  get projectsUrl () { return `${this.v3}/projects` }
  get tokensUrl () { return `${this.v3}/auth/tokens?nocatalog` }
  get usersUrl () { return `${this.v3}/users` }

  async getProject (id) {
    const response = await axios.get(`${this.projectsUrl}/${id}`, this.client.getAuthHeaders())
    return response.data.project
  }

  async getProjectsAuth () {
    const response = await axios.get(this.projectsAuthUrl, this.client.getAuthHeaders(false))
    return response.data.projects
  }

  async getProjects (scoped = false) {
    const response = await axios.get(this.projectsUrl, this.client.getAuthHeaders(scoped))
    return response.data.projects
  }

  async createProject (params) {
    const body = { project: params }
    const response = await axios.post(this.projectsUrl, body, this.client.getAuthHeaders())
    return response.data.project
  }

  async updateProject (id, params) {
    const body = { project: params }
    const url = `${this.projectsUrl}/${id}`
    const response = await axios.patch(url, body, this.client.getAuthHeaders())
    return response.data.project
  }

  async deleteProject (projectId) {
    try {
      await axios.delete(`${this.projectsUrl}/${projectId}`, this.client.getAuthHeaders())
      return projectId
    } catch (err) {
      throw new Error(`Unable to delete non-existant project`)
    }
  }

  async changeProjectScope (projectId) {
    const body = constructAuthBody('token', this.client.unscopedToken)
    body.auth.scope = { project: { id: projectId } }
    try {
      const response = await axios.post(this.tokensUrl, body)
      const scopedToken = response.headers['x-subject-token']
      const _user = response.data.token.user
      const roles = response.data.token.roles

      const roleNames = pluck('name', roles)
      const role = getHighestRole(roleNames)

      const user = {
        username: _user.name,
        userId: _user.id,
        tenantId: projectId,
        role
      }
      this.client.activeProjectId = projectId
      this.client.scopedToken = scopedToken
      await this.getServiceCatalog()
      return { scopedToken, user }
    } catch (err) {
      // authentication failed
      console.error(err)
      return null
    }
  }

  async authenticate (username, password) {
    const body = constructAuthBody('password', username, password)

    try {
      const response = await axios.post(this.tokensUrl, body)
      const unscopedToken = response.headers['x-subject-token']
      this.client.unscopedToken = unscopedToken
      return unscopedToken
    } catch (err) {
      // authentication failed
      return null
    }
  }

  async renewToken (unscopedToken) {
    const body = constructAuthBody('token', unscopedToken)
    try {
      const response = await axios.post(this.tokensUrl, body)
      const newUnscopedToken = response.headers['x-subject-token']
      this.client.unscopedToken = newUnscopedToken
      return newUnscopedToken
    } catch (err) {
      // authentication failed
      return null
    }
  }

  async renewScopedToken () {
    const body = constructAuthBody('token', this.client.unscopedToken)
    const projectId = this.client.activeProjectId
    body.auth.scope = { project: { id: projectId } }
    try {
      const response = await axios.post(this.tokensUrl, body)
      const scopedToken = response.headers['x-subject-token']
      this.client.scopedToken = scopedToken
      return scopedToken
    } catch (err) {
      // authentication failed
      console.error(err)
      return null
    }
  }

  async getRegions () {
    const response = await axios.get(this.regionsUrl, this.client.getAuthHeaders())
    return response.data.regions
  }

  // Allow programmatic access
  regions = {
    list: this.getRegions.bind(this),
  }

  async getServiceCatalog () {
    const response = await axios.get(this.catalogUrl, this.client.getAuthHeaders())
    this.client.serviceCatalog = response.data.catalog
    return response.data.catalog
  }

  async getEndpoints () {
    const response = await axios.get(this.endpointsUrl, this.client.getAuthHeaders())
    this.client.endpoints = response.data.endpoints
    return response.data.endpoints
  }

  async getServicesForActiveRegion () {
    if (!this.client.serviceCatalog) {
      await this.getServiceCatalog()
    }
    const servicesByRegion = groupByRegion(this.client.serviceCatalog)
    if (!this.client.activeRegion) {
      // Just assume the first region we come across if there isn't one set.
      this.client.activeRegion = this.client.serviceCatalog[0].endpoints[0].region
    }
    return servicesByRegion[this.client.activeRegion]
  }

  async getUser (id) {
    const response = await axios.get(`${this.usersUrl}/${id}`, this.client.getAuthHeaders())
    return response.data.user
  }

  async getUsers () {
    const response = await axios.get(this.usersUrl, this.client.getAuthHeaders())
    return response.data.users
  }

  async createUser (params) {
    const body = { user: params }
    const response = await axios.post(this.usersUrl, body, this.client.getAuthHeaders())
    return response.data.user
  }

  async updateUser (id, params) {
    const body = { user: params }
    const url = `${this.usersUrl}/${id}`
    const response = await axios.patch(url, body, this.client.getAuthHeaders())
    return response.data.user
  }

  async deleteUser (userId) {
    try {
      await axios.delete(`${this.usersUrl}/${userId}`, this.client.getAuthHeaders())
      return userId
    } catch (err) {
      throw new Error(`Unable to delete non-existant user`)
    }
  }
}

export default Keystone
