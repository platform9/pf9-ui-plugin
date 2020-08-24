import { pluck, pipe, values, head } from 'ramda'
import { getHighestRole } from './helpers'
import { pathJoin, capitalizeString } from 'utils/misc'
import { pathStr } from 'utils/fp'
import ApiService from 'api-client/ApiService'
import {
  AuthToken,
  GetProjectsAuth,
  GetServiceCatalog,
  GetRegions,
  GetFeatureLinks,
  GetFeatures,
  GetAllTenantsAllUsers,
  GetUsers,
  GetCredentials,
  GetRoles,
  GetUserRoleAssignments,
  UpdateProject,
  UpdateUser,
  Catalog,
  ServicesByRegion,
  ServicesByName,
  IInterfaceByName,
} from './keystone.model'

const constructAuthFromToken = (token: string, projectId?: string) => {
  return {
    auth: {
      ...(projectId ? { scope: { project: { id: projectId } } } : {}),
      identity: {
        methods: ['token'],
        token: { id: token },
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
        },
      },
    },
  }
}

const groupByRegion = (catalog: Catalog[]): ServicesByRegion => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const regions = {} as ServicesByRegion
  catalog.forEach((service) => {
    const { name } = service
    service.endpoints.forEach((endpoint) => {
      const { region } = endpoint
      regions[region] = regions[region] || {}
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      regions[region][name] = regions[region][name] || ({} as IInterfaceByName)
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
  public getClassName() {
    return 'keystone'
  }

  protected async getEndpoint() {
    return Promise.resolve(this.client.options.keystoneEndpoint)
  }

  get v3() {
    return `/v3`
  }

  get adminV3() {
    return `/v3`
  }

  get catalogUrl() {
    return `${this.v3}/auth/catalog`
  }

  get projectsAuthUrl() {
    return `${this.v3}/auth/projects`
  }

  get endpointsUrl() {
    return `${this.v3}/endpoints`
  }

  get regionsUrl() {
    return `${this.v3}/regions`
  }

  get projectsUrl() {
    return `${this.v3}/projects`
  }

  get allTenantsAllUsersUrl() {
    return `${this.adminV3}/PF9-KSADM/all_tenants_all_users`
  }

  get roleAssignments() {
    return `${this.adminV3}/role_assignments`
  }

  get tokensUrl() {
    return `${this.v3}/auth/tokens?nocatalog`
  }

  get usersUrl() {
    return `${this.v3}/users`
  }

  get credentialsUrl() {
    return `${this.v3}/credentials`
  }

  get groupsUrl() {
    return `${this.v3}/groups`
  }

  get groupMappingsUrl() {
    return `${this.v3}/OS-FEDERATION/mappings`
  }

  get rolesUrl() {
    return `${this.v3}/roles`
  }

  getProject = async (id) => {
    const data = await this.client.basicGet<any>(
      this.getClassName(),
      'getProject',
      `${this.projectsUrl}/${id}`,
    )
    return data.project
  }

  getProjectsAuth = async () => {
    const response = await this.client.rawGet<GetProjectsAuth>(
      this.getClassName(),
      'getProjectsAuth',
      this.projectsAuthUrl,
      this.client.getAuthHeaders(false),
    )
    return response.data.projects
  }

  getProjects = async (scoped = false) => {
    const response = await this.client.rawGet<any>(
      this.getClassName(),
      'getProjects',
      this.projectsUrl,
      this.client.getAuthHeaders(scoped),
    )
    return response.data.projects
  }

  getAllTenantsAllUsers = async () => {
    const data = await this.client.basicGet<GetAllTenantsAllUsers>(
      this.getClassName(),
      'getAllTenantsAllUsers',
      this.allTenantsAllUsersUrl,
    )
    return data.tenants
  }

  getTenantRoleAssignments = async (tenantId) => {
    const data = await this.client.basicGet<GetUserRoleAssignments>(
      this.getClassName(),
      'getTenantRoleAssignments',
      this.roleAssignments,
      {
        'scope.project.id': tenantId,
        include_names: true,
      },
    )
    return data.role_assignments
  }

  getUserRoleAssignments = async (userId) => {
    const data = await this.client.basicGet<GetUserRoleAssignments>(
      this.getClassName(),
      'getUserRoleAssignments',
      this.roleAssignments,
      {
        'user.id': userId,
        include_names: true,
      },
    )
    return data.role_assignments
  }

  addUserRole = async ({ tenantId, userId, roleId }) => {
    await this.client.basicPut<string>(
      this.getClassName(),
      'addUserRole',
      pathJoin(this.projectsUrl, `${tenantId}/users/${userId}/roles/${roleId}`),
      null,
    )
    return { tenantId, userId, roleId }
  }

  deleteUserRole = async ({ tenantId, userId, roleId }) => {
    try {
      await this.client.basicDelete<any>(
        this.getClassName(),
        'deleteUserRole',
        pathJoin(this.projectsUrl, `${tenantId}/users/${userId}/roles/${roleId}`),
      )
      return { tenantId, userId, roleId }
    } catch (err) {
      throw new Error('Unable to delete non-existant project')
    }
  }

  getGroups = async () => {
    const data = await this.client.basicGet<any>(this.getClassName(), 'getGroups', this.groupsUrl)
    return data.groups
  }

  getGroupMappings = async () => {
    const data = await this.client.basicGet<any>(
      this.getClassName(),
      'getGroupMappings',
      this.groupMappingsUrl,
    )
    return data.mappings
  }

  getRoles = async () => {
    const data = await this.client.basicGet<GetRoles>(
      this.getClassName(),
      'getRoles',
      this.rolesUrl,
    )
    return data.roles
  }

  createProject = async (params) => {
    const body = { project: params }
    const data = await this.client.basicPost<any>(
      this.getClassName(),
      'createProject',
      this.projectsUrl,
      body,
    )
    return data.project
  }

  updateProject = async (id, params) => {
    const body = { project: params }
    const url = `${this.projectsUrl}/${id}`
    const data = await this.client.basicPatch<UpdateProject>(
      this.getClassName(),
      'updateProject',
      url,
      body,
    )
    return data.project
  }

  deleteProject = async (projectId) => {
    try {
      await this.client.basicDelete<any>(
        this.getClassName(),
        'deleteProject',
        `${this.projectsUrl}/${projectId}`,
      )
      return projectId
    } catch (err) {
      throw new Error('Unable to delete non-existant project')
    }
  }

  changeProjectScope = async (projectId) => {
    const body = constructAuthFromToken(this.client.unscopedToken, projectId)
    try {
      const response = await this.client.rawPost<AuthToken>(
        this.getClassName(),
        'changeProjectScope',
        this.tokensUrl,
        body,
      )
      const scopedToken = response.headers['x-subject-token']
      // FIXME: fix typings here
      const roles = response?.data?.token?.roles || [] // pathStr('data.token.roles', response) as Array<{ [key: string]: any }>
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
      const response = await this.client.rawPost<AuthToken>(
        this.getClassName(),
        'authenticate',
        this.tokensUrl,
        body,
      )
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
      const response = await this.client.rawPost<AuthToken>(
        this.getClassName(),
        'getUnscopedTokenWithToken',
        this.tokensUrl,
        body,
      )
      const username = response.data.token.user.name
      const { expires_at: expiresAt, issued_at: issuedAt } = response.data.token
      const unscopedToken = response.headers['x-subject-token']
      this.client.unscopedToken = unscopedToken
      return { unscopedToken, username, expiresAt, issuedAt }
    } catch (err) {
      return {}
    }
  }

  renewToken = async (currUnscopedToken) => {
    const body = constructAuthFromToken(currUnscopedToken)
    try {
      const response = await this.client.rawPost<AuthToken>(
        this.getClassName(),
        'renewToken',
        this.tokensUrl,
        body,
      )
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
      const response = await this.client.rawPost<AuthToken>(
        this.getClassName(),
        'renewScopedToken',
        this.tokensUrl,
        body,
      )
      const scopedToken = response.headers['x-subject-token']
      this.client.scopedToken = scopedToken
      return scopedToken
    } catch (err) {
      // authentication failed
      console.error(err)
      return null
    }
  }

  getFeatures = async () => {
    try {
      const linksUrl = await this.getServiceEndpoint('regioninfo', 'public')
      const { links } = await this.client.basicGet<GetFeatureLinks>(
        this.getClassName(),
        'getFeatures',
        linksUrl,
      )
      const featuresUrl = links.features
      const timestamp = new Date().getTime()
      const features = await this.client.basicGet<GetFeatures>(
        this.getClassName(),
        'getFeatures/featuresUrl',
        `${featuresUrl}?tag=${timestamp}`,
      )
      return features
    } catch (err) {
      console.error(err)
      return null
    }
  }

  getDownloadLinks = async () => {
    try {
      const linksUrl = await this.getServiceEndpoint('regioninfo', 'internal')
      const { links } = await this.client.basicGet<any>(
        this.getClassName(),
        'getDownloadLinks',
        linksUrl,
      )
      return links
    } catch (err) {
      console.error(err)
      return null
    }
  }

  // set cookie for accessing hostagent rpms
  resetCookie = async () => {
    try {
      const linksUrl = await this.getServiceEndpoint('regioninfo', 'public')
      const { links } = await this.client.basicGet<GetFeatureLinks>(
        this.getClassName(),
        'resetCookie/links',
        linksUrl,
      )
      const token2cookieUrl = links.token2cookie
      const authHeaders = this.client.getAuthHeaders()
      await this.client.rawGet<string>(this.getClassName(), 'resetCookie', token2cookieUrl, {
        ...authHeaders,
        withCredentials: true,
      })
    } catch (err) {
      console.warn('Setting session cookie for accessing hostagent rpms failed')
    }
  }

  getRegions = async () => {
    const data = await this.client.basicGet<GetRegions>(
      this.getClassName(),
      'getRegions',
      this.regionsUrl,
    )
    return data.regions
  }

  // Allow programmatic access
  regions = {
    list: this.getRegions.bind(this),
  }

  getServiceCatalog = async () => {
    const data = await this.client.basicGet<GetServiceCatalog>(
      this.getClassName(),
      'getServiceCatalog',
      this.catalogUrl,
    )
    this.client.serviceCatalog = data.catalog
    return data.catalog
  }

  getEndpoints = async () => {
    const data = await this.client.basicGet<any>(
      this.getClassName(),
      'getEndpoints',
      this.endpointsUrl,
    )
    this.client.endpoints = data.endpoints
    return data.endpoints
  }

  getServicesForActiveRegion = async (): Promise<ServicesByName> => {
    const catalog = await this.getServiceCatalog()
    const { activeRegion, serviceCatalog = catalog } = this.client
    const servicesByRegion = groupByRegion(serviceCatalog)

    if (!activeRegion || !servicesByRegion.hasOwnProperty(activeRegion)) {
      // Just assume the first region we come across if there isn't one set.
      return pipe<ServicesByRegion, ServicesByName[], ServicesByName>(
        values,
        head,
      )(servicesByRegion)
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
    const data = await this.client.basicGet<GetCredentials>(
      this.getClassName(),
      'getCredentials',
      this.credentialsUrl,
    )
    return data.credentials
  }

  getUser = async (id) => {
    const data = await this.client.basicGet<any>(
      this.getClassName(),
      'getUser',
      `${this.usersUrl}/${id}`,
    )
    return data.user
  }

  getUsers = async () => {
    const data = await this.client.basicGet<GetUsers>(
      this.getClassName(),
      'getUsers',
      this.usersUrl,
    )
    return data.users
  }

  createUser = async (params) => {
    const body = { user: params }
    const data = await this.client.basicPost<any>(
      this.getClassName(),
      'createUser',
      this.usersUrl,
      body,
    )
    return data.user
  }

  updateUser = async (id, params) => {
    const body = { user: params }
    const url = `${this.usersUrl}/${id}`
    const data = await this.client.basicPatch<UpdateUser>(
      this.getClassName(),
      'updateUser',
      url,
      body,
    )
    return data.user
  }

  updateUserPassword = async (id, params) => {
    const body = { user: params }
    const url = `${this.usersUrl}/${id}/password`
    const data = await this.client.basicPost<any>(
      this.getClassName(),
      'updateUserPassword',
      url,
      body,
    )
    return data.user
  }

  deleteUser = async (userId) => {
    try {
      await this.client.basicDelete<any>(
        this.getClassName(),
        'deleteUser',
        `${this.usersUrl}/${userId}`,
      )
      return userId
    } catch (err) {
      throw new Error('Unable to delete non-existant user')
    }
  }
}

export default Keystone
