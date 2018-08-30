import axios from 'axios'

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
  get endpointsUrl () { return `${this.v3}/endpoints` }
  get regionsUrl () { return `${this.v3}/regions` }
  get projectsUrl () { return `${this.v3}/projects` }
  get tokensUrl () { return `${this.v3}/auth/tokens?nocatalog` }
  get usersUrl () { return `${this.v3}/users` }

  async getProject (id) {
    const response = await axios.get(`${this.projectsUrl}/${id}`, this.client.getAuthHeaders())
    return response.data.project
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
      this.client.scopedToken = scopedToken
      return scopedToken
    } catch (err) {
      // authentication failed
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

  async renewToken (token) {
    const body = constructAuthBody('token', token)
    try {
      const response = await axios.post(this.tokensUrl, body)
      const newToken = response.headers['x-subject-token']
      // We're not sure if this is a scoped or unscoped token but it should be
      // fine to just set both of them here since scopedToken will be set later
      // on if it needs to be.
      this.client.unscopedToken = newToken
      this.client.scopedToken = newToken
      return newToken
    } catch (err) {
      // authentication failed
      return null
    }
  }

  async getRegions () {
    const response = await axios.get(this.regionsUrl, this.client.getAuthHeaders())
    return response.data.regions
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
    if (!this.client.activeRegion) {
      throw new Error('Must first select a region before getting services for that region')
    }
    if (!this.client.serviceCatalog) {
      await this.getServiceCatalog()
    }
    const servicesByRegion = groupByRegion(this.client.serviceCatalog)
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
