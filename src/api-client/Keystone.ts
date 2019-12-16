import { pluck, pipe, values, head } from 'ramda'
import { getHighestRole } from './helpers'
import { pathJoin, capitalizeString } from 'utils/misc'
import { pathStr } from 'utils/fp'
import ApiService from 'api-client/ApiService'

const constructAuthFromToken = (token: string, projectId?: string) => {
  return {
    auth: {
      ...(projectId ? { scope: { project: { id: projectId } } } : {}),
      identity: {
        methods: ['token'],
        token: { id: token }
      },
    },
  }
}

const constructAuthFromCredentials = (username, password) => {
  return {
    auth: {
      identity: {
        methods: ['password'],
        password: {
          user: {
            name: username,
            domain: { id: 'default' },
            password,
          },
        }
      },
    },
  }
}

const groupByRegion = catalog => {
  const regions = {}
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

class Keystone extends ApiService {
  endpoint = () => {
    return this.client.options.keystoneEndpoint
  }

  get v3 () { return `${this.endpoint()}/v3` }

  get adminV3 () { return `${this.endpoint()}/v3` }

  get catalogUrl () { return `${this.v3}/auth/catalog` }

  get projectsAuthUrl () { return `${this.v3}/auth/projects` }

  get endpointsUrl () { return `${this.v3}/endpoints` }

  get regionsUrl () { return `${this.v3}/regions` }

  get projectsUrl () { return `${this.v3}/projects` }

  get allTenantsAllUsersUrl () { return `${this.adminV3}/PF9-KSADM/all_tenants_all_users` }

  get roleAssignments () { return `${this.adminV3}/role_assignments` }

  get tokensUrl () { return `${this.v3}/auth/tokens?nocatalog` }

  get usersUrl () { return `${this.v3}/users` }

  get credentialsUrl () { return `${this.v3}/credentials` }

  get groupsUrl () { return `${this.v3}/groups` }

  get groupMappingsUrl () { return `${this.v3}/OS-FEDERATION/mappings` }

  get rolesUrl () { return `${this.v3}/roles` }

  getProject = async (id) => {
    const data = await this.client.basicGet(`${this.projectsUrl}/${id}`)
    return data.project
  }

  getProjectsAuth = async () => {
    const response = await this.client.rawGet(this.projectsAuthUrl, this.client.getAuthHeaders(false))
    return response.data.projects
  }

  getProjects = async (scoped = false) => {
    const response = await this.client.rawGet(this.projectsUrl, this.client.getAuthHeaders(scoped))
    return response.data.projects
  }

  getAllTenantsAllUsers = async () => {
    const data = await this.client.basicGet(this.allTenantsAllUsersUrl)
    return data.tenants
  }

  getTenantRoleAssignments = async tenantId => {
    const data = await this.client.basicGet(this.roleAssignments, {
      'scope.project.id': tenantId,
      include_names: true,
    })
    return data.role_assignments
  }

  getUserRoleAssignments = async userId => {
    const data = await this.client.basicGet(this.roleAssignments, {
      'user.id': userId,
      include_names: true,
    })
    return data.role_assignments
  }

  addUserRole = async ({ tenantId, userId, roleId }) => {
    await this.client.basicPut(pathJoin(
      this.projectsUrl,
      `${tenantId}/users/${userId}/roles/${roleId}`,
    ), null)
    return { tenantId, userId, roleId }
  }

  deleteUserRole = async ({ tenantId, userId, roleId }) => {
    try {
      await this.client.basicDelete(pathJoin(
        this.projectsUrl,
        `${tenantId}/users/${userId}/roles/${roleId}`,
      ))
      return { tenantId, userId, roleId }
    } catch (err) {
      throw new Error('Unable to delete non-existant project')
    }
  }

  getGroups = async () => {
    const data = await this.client.basicGet(this.groupsUrl)
    return data.groups
  }

  getGroupMappings = async () => {
    const data = await this.client.basicGet(this.groupMappingsUrl)
    return data.mappings
  }

  getRoles = async () => {
    const data = await this.client.basicGet(this.rolesUrl)
    return data.roles
  }

  createProject = async (params) => {
    const body = { project: params }
    const data = await this.client.basicPost(this.projectsUrl, body)
    return data.project
  }

  updateProject = async (id, params) => {
    const body = { project: params }
    const url = `${this.projectsUrl}/${id}`
    const data = await this.client.basicPut(url, body)
    return data.project
  }

  deleteProject = async (projectId) => {
    try {
      await this.client.basicDelete(`${this.projectsUrl}/${projectId}`)
      return projectId
    } catch (err) {
      throw new Error('Unable to delete non-existant project')
    }
  }

  changeProjectScope = async (projectId) => {
    const body = constructAuthFromToken(this.client.unscopedToken, projectId)
    try {
      const response = await this.client.rawPost(this.tokensUrl, body)
      const scopedToken = response.headers['x-subject-token']
      // FIXME: fix typings here
      const roles = pathStr('data.token.roles', response) as Array<{ [key: string]: any }>
      const roleNames = pluck('name', roles)
      const role = getHighestRole(roleNames)
      const _user = pathStr('data.token.user', response)
      // Extra properties in user are required to ensure
      // functionality in the old UI
      const user = {
        ..._user,
        username: _user.name,
        userId: _user.id,
        role: role,
        displayName: _user.displayname || _user.name,
      }
      this.client.activeProjectId = projectId
      this.client.scopedToken = scopedToken
      await this.getServiceCatalog()

      return { user, role, scopedToken }
    } catch (err) {
      // authentication failed
      console.error(err)
      return {}
    }
  }

  authenticate = async (username, password) => {
    const body = constructAuthFromCredentials(username, password)
    try {
      const response = await this.client.rawPost(this.tokensUrl, body)
      const { expires_at: expiresAt, issued_at: issuedAt } = response.data.token
      const unscopedToken = response.headers['x-subject-token']
      this.client.unscopedToken = unscopedToken
      return { unscopedToken, username, expiresAt, issuedAt }
    } catch (err) {
      // authentication failed
      return {}
    }
  }

  getUnscopedTokenWithToken = async (token) => {
    const authBody = constructAuthFromToken(token)
    const body = {
      ...authBody,
      auth: {
        ...authBody.auth,
        scope: 'unscoped',
      },
    }
    try {
      const response = await this.client.rawPost(this.tokensUrl, body)
      const username = response.data.token.user.name
      const unscopedToken = response.headers['x-subject-token']
      this.client.unscopedToken = unscopedToken
      return { unscopedToken, username }
    } catch (err) {
      return {}
    }
  }

  renewToken = async (currUnscopedToken) => {
    const body = constructAuthFromToken(currUnscopedToken)
    try {
      const response = await this.client.rawPost(this.tokensUrl, body)
      const { expires_at: expiresAt, issued_at: issuedAt } = response.data.token
      const unscopedToken = response.headers['x-subject-token']
      this.client.unscopedToken = unscopedToken
      return { unscopedToken, expiresAt, issuedAt }
    } catch (err) {
      // authentication failed
      return {}
    }
  }

  renewScopedToken = async () => {
    const projectId = this.client.activeProjectId
    const body = constructAuthFromToken(this.client.unscopedToken, projectId)
    try {
      const response = await this.client.rawPost(this.tokensUrl, body)
      const scopedToken = response.headers['x-subject-token']
      this.client.scopedToken = scopedToken
      return scopedToken
    } catch (err) {
      // authentication failed
      console.error(err)
      return null
    }
  }

  // set cookie for accessing hostagent rpms
  resetCookie = async () => {
    try {
      const linksUrl = await this.getServiceEndpoint('regioninfo', 'public')
      const { links } = await this.client.basicGet(linksUrl)
      const token2cookieUrl = links.token2cookie
      const authHeaders = this.client.getAuthHeaders()
      await this.client.rawGet(token2cookieUrl, {
        ...authHeaders, withCredentials: true
      })
    } catch (err) {
      console.warn('Setting session cookie for accessing hostagent rpms failed')
    }
  }

  getRegions = async () => {
    const data = await this.client.basicGet(this.regionsUrl)
    return data.regions
  }

  // Allow programmatic access
  regions = {
    list: this.getRegions.bind(this),
  }

  getServiceCatalog = async () => {
    const data = await this.client.basicGet(this.catalogUrl)
    this.client.serviceCatalog = data.catalog
    return data.catalog
  }

  getEndpoints = async () => {
    const data = await this.client.basicGet(this.endpointsUrl)
    this.client.endpoints = data.endpoints
    return data.endpoints
  }

  getServicesForActiveRegion = async () => {
    const {
      activeRegion,
      serviceCatalog = await this.getServiceCatalog(),
    } = this.client
    const servicesByRegion = groupByRegion(serviceCatalog)

    if (!activeRegion || !servicesByRegion.hasOwnProperty(activeRegion)) {
      // Just assume the first region we come across if there isn't one set.
      return pipe(values, head)(servicesByRegion)
    }
    return servicesByRegion[activeRegion]
  }

  getServiceEndpoint = async (serviceName, type) => {
    const services = await this.getServicesForActiveRegion()
    const endpoint = pathStr(`${serviceName}.${type}.url`, services)
    if (!endpoint) {
      throw new Error(`${capitalizeString(serviceName)} endpoint not available in active region`)
    }
    return endpoint
  }

  getCredentials = async () => {
    const data = await this.client.basicGet(this.credentialsUrl)
    return data.credentials
  }

  getUser = async (id) => {
    const data = await this.client.basicGet(`${this.usersUrl}/${id}`)
    return data.user
  }

  getUsers = async () => {
    const data = await this.client.basicGet(this.usersUrl)
    return data.users
  }

  createUser = async (params) => {
    const body = { user: params }
    const data = await this.client.basicPost(this.usersUrl, body)
    return data.user
  }

  updateUser = async (id, params) => {
    const body = { user: params }
    const url = `${this.usersUrl}/${id}`
    const data = await this.client.basicPatch(url, body)
    return data.user
  }

  deleteUser = async (userId) => {
    try {
      await this.client.basicDelete(`${this.usersUrl}/${userId}`)
      return userId
    } catch (err) {
      throw new Error('Unable to delete non-existant user')
    }
  }
}

export default Keystone
