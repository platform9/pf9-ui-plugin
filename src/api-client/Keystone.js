import axios from 'axios'
import { pluck } from 'ramda'
import { getHighestRole } from './helpers'
import { pathJoin } from 'utils/misc'

const authConstructors = {
  password: (username, password) => ({
    user: {
      name: username,
      domain: { id: 'default' },
      password,
    },
  }),

  token: token => ({ id: token }),
}

const constructAuthBody = (method, ...args) => {
  const body = {
    auth: {
      identity: {
        methods: [method],
        [method]: authConstructors[method](...args),
      },
    },
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

  get adminEndpoint () { return this.client.options.keystoneAdminEndpoint }

  get v3 () { return `${this.endpoint}/v3` }

  get adminV3 () { return `${this.endpoint}/v3` }

  get catalogUrl () { return `${this.v3}/auth/catalog` }

  get projectsAuthUrl () { return `${this.v3}/auth/projects` }

  get endpointsUrl () { return `${this.v3}/endpoints` }

  get regionsUrl () { return `${this.v3}/regions` }

  get projectsUrl () { return `${this.v3}/projects` }

  get allTenantsAllUsersUrl () { return `${this.adminV3}/PF9-KSADM/all_tenants_all_users` }

  get tokensUrl () { return `${this.v3}/auth/tokens?nocatalog` }

  get usersUrl () { return `${this.v3}/users` }

  get credentialsUrl () { return `${this.v3}/credentials` }

  get groupsUrl () { return `${this.v3}/groups` }

  get groupMappingsUrl () { return `${this.v3}/OS-FEDERATION/mappings` }

  get rolesUrl () { return `${this.v3}/roles` }

  getProject = async (id) => {
    const response = await axios.get(`${this.projectsUrl}/${id}`, this.client.getAuthHeaders())
    return response.data.project
  }

  getProjectsAuth = async () => {
    const response = await axios.get(this.projectsAuthUrl, this.client.getAuthHeaders(false))
    return response.data.projects
  }

  getProjects = async (scoped = false) => {
    const response = await axios.get(this.projectsUrl, this.client.getAuthHeaders(scoped))
    return response.data.projects
  }

  getAllTenantsAllUsers = async () => {
    const response = await axios.get(this.allTenantsAllUsersUrl, this.client.getAuthHeaders())
    return response.data.tenants
  }

  addUserRole = async ({ tenantId, userId, roleId }) => {
    const response = await axios.put(pathJoin(
      this.projectsUrl,
      `${tenantId}/users/${userId}/roles/${roleId}`,
    ))
    console.log(response)
    return { tenantId, userId, roleId }
  }

  deleteUserRole = async ({ tenantId, userId, roleId }) => {
    try {
      await axios.delete(pathJoin(
        this.projectsUrl,
        `${tenantId}/users/${userId}/roles/${roleId}`,
      ))
      return { tenantId, userId, roleId }
    } catch (err) {
      throw new Error(`Unable to delete non-existant project`)
    }
  }

  getGroups = async () => {
    const response = await axios.get(this.groupsUrl, this.client.getAuthHeaders())
    return response.data.groups
  }

  getGroupMappings = async () => {
    const response = await axios.get(this.groupMappingsUrl, this.client.getAuthHeaders())
    return response.data.mappings
  }

  getRoles = async () => {
    const response = await axios.get(this.rolesUrl, this.client.getAuthHeaders())
    return response.data.roles
  }

  createProject = async (params) => {
    const body = { project: params }
    const response = await axios.post(this.projectsUrl, body, this.client.getAuthHeaders())
    return response.data.project
  }

  updateProject = async (id, params) => {
    const body = { project: params }
    const url = `${this.projectsUrl}/${id}`
    const response = await axios.patch(url, body, this.client.getAuthHeaders())
    return response.data.project
  }

  deleteProject = async (projectId) => {
    try {
      await axios.delete(`${this.projectsUrl}/${projectId}`, this.client.getAuthHeaders())
      return projectId
    } catch (err) {
      throw new Error(`Unable to delete non-existant project`)
    }
  }

  changeProjectScope = async (projectId) => {
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
        role,
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

  authenticate = async (username, password) => {
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

  renewToken = async (unscopedToken) => {
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

  renewScopedToken = async () => {
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

  getRegions = async () => {
    const response = await axios.get(this.regionsUrl, this.client.getAuthHeaders())
    return response.data.regions
  }

  // Allow programmatic access
  regions = {
    list: this.getRegions.bind(this),
  }

  getServiceCatalog = async () => {
    const response = await axios.get(this.catalogUrl, this.client.getAuthHeaders())
    this.client.serviceCatalog = response.data.catalog
    return response.data.catalog
  }

  getEndpoints = async () => {
    const response = await axios.get(this.endpointsUrl, this.client.getAuthHeaders())
    this.client.endpoints = response.data.endpoints
    return response.data.endpoints
  }

  getServicesForActiveRegion = async () => {
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

  getCredentials = async () => {
    const response = await axios.get(this.credentialsUrl, this.client.getAuthHeaders())
    return response.data.credentials
  }

  getUser = async (id) => {
    const response = await axios.get(`${this.usersUrl}/${id}`, this.client.getAuthHeaders())
    return response.data.user
  }

  getUsers = async () => {
    const response = await axios.get(this.usersUrl, this.client.getAuthHeaders())
    return response.data.users
  }

  createUser = async (params) => {
    const body = { user: params }
    const response = await axios.post(this.usersUrl, body, this.client.getAuthHeaders())
    return response.data.user
  }

  updateUser = async (id, params) => {
    const body = { user: params }
    const url = `${this.usersUrl}/${id}`
    const response = await axios.patch(url, body, this.client.getAuthHeaders())
    return response.data.user
  }

  deleteUser = async (userId) => {
    try {
      await axios.delete(`${this.usersUrl}/${userId}`, this.client.getAuthHeaders())
      return userId
    } catch (err) {
      throw new Error(`Unable to delete non-existant user`)
    }
  }
}

export default Keystone
