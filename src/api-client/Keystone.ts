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
    const data = await this.client.basicGet<any>({
      url: `${this.projectsUrl}/${id}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getProject',
      },
    })
    return data.project
  }

  getProjectsAuth = async () => {
    const response = await this.client.rawGet<GetProjectsAuth>({
      url: this.projectsAuthUrl,
      config: this.client.getAuthHeaders(false),
      options: {
        clsName: this.getClassName(),
        mthdName: 'getProjectsAuth',
      },
    })
    return response.data.projects
  }

  getProjects = async (scoped = false) => {
    const response = await this.client.rawGet<any>({
      url: this.projectsUrl,
      config: this.client.getAuthHeaders(scoped),
      options: {
        clsName: this.getClassName(),
        mthdName: 'getProjects',
      },
    })
    return response.data.projects
  }

  getAllTenantsAllUsers = async () => {
    const data = await this.client.basicGet<GetAllTenantsAllUsers>({
      url: this.allTenantsAllUsersUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getAllTenantsAllUsers',
      },
    })
    return data.tenants
  }

  getTenantRoleAssignments = async (tenantId) => {
    const data = await this.client.basicGet<GetUserRoleAssignments>({
      url: this.roleAssignments,
      params: {
        'scope.project.id': tenantId,
        include_names: true,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'getTenantRoleAssignments',
      },
    })
    return data.role_assignments
  }

  getUserRoleAssignments = async (userId) => {
    const data = await this.client.basicGet<GetUserRoleAssignments>({
      url: this.roleAssignments,
      params: {
        'user.id': userId,
        include_names: true,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'getUserRoleAssignments',
      },
    })
    return data.role_assignments
  }

  addUserRole = async ({ tenantId, userId, roleId }) => {
    await this.client.basicPut<string>({
      url: pathJoin(this.projectsUrl, `${tenantId}/users/${userId}/roles/${roleId}`),
      body: null,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addUserRole',
      },
    })
    return { tenantId, userId, roleId }
  }

  deleteUserRole = async ({ tenantId, userId, roleId }) => {
    try {
      await this.client.basicDelete<any>({
        url: pathJoin(this.projectsUrl, `${tenantId}/users/${userId}/roles/${roleId}`),
        options: {
          clsName: this.getClassName(),
          mthdName: 'deleteUserRole',
        },
      })
      return { tenantId, userId, roleId }
    } catch (err) {
      throw new Error('Unable to delete non-existant project')
    }
  }

  getGroups = async () => {
    const data = await this.client.basicGet<any>({
      url: this.groupsUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getGroups',
      },
    })
    return data.groups
  }

  getGroupMappings = async () => {
    const data = await this.client.basicGet<any>({
      url: this.groupMappingsUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getGroupMappings',
      },
    })
    return data.mappings
  }

  getRoles = async () => {
    const data = await this.client.basicGet<GetRoles>({
      url: this.rolesUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRoles',
      },
    })
    return data.roles
  }

  createProject = async (params) => {
    const body = { project: params }
    const data = await this.client.basicPost<any>({
      url: this.projectsUrl,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createProject',
      },
    })
    return data.project
  }

  updateProject = async (id, params) => {
    const body = { project: params }
    const url = `${this.projectsUrl}/${id}`
    const data = await this.client.basicPatch<UpdateProject>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateProject',
      },
    })
    return data.project
  }

  deleteProject = async (projectId) => {
    try {
      await this.client.basicDelete<any>({
        url: `${this.projectsUrl}/${projectId}`,
        options: {
          clsName: this.getClassName(),
          mthdName: 'deleteProject',
        },
      })
      return projectId
    } catch (err) {
      throw new Error('Unable to delete non-existant project')
    }
  }

  changeProjectScope = async (projectId) => {
    const body = constructAuthFromToken(this.client.unscopedToken, projectId)
    try {
      const response = await this.client.rawPost<AuthToken>({
        url: this.tokensUrl,
        data: body,
        options: {
          clsName: this.getClassName(),
          mthdName: 'changeProjectScope',
        },
      })
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
      const response = await this.client.rawPost<AuthToken>({
        url: this.tokensUrl,
        data: body,
        options: {
          clsName: this.getClassName(),
          mthdName: 'authenticate',
        },
      })
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
      const response = await this.client.rawPost<AuthToken>({
        url: this.tokensUrl,
        data: body,
        options: {
          clsName: this.getClassName(),
          mthdName: 'getUnscopedTokenWithToken',
        },
      })
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
      const response = await this.client.rawPost<AuthToken>({
        url: this.tokensUrl,
        data: body,
        options: {
          clsName: this.getClassName(),
          mthdName: 'renewToken',
        },
      })
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
      const response = await this.client.rawPost<AuthToken>({
        url: this.tokensUrl,
        data: body,
        options: {
          clsName: this.getClassName(),
          mthdName: 'renewScopedToken',
        },
      })
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
      const { links } = await this.client.basicGet<GetFeatureLinks>({
        url: linksUrl,
        options: {
          clsName: this.getClassName(),
          mthdName: 'getFeatures',
        },
      })
      const featuresUrl = links.features
      const timestamp = new Date().getTime()
      const features = await this.client.basicGet<GetFeatures>({
        endpoint: `${featuresUrl}?tag=${timestamp}`,
        url: '',
        options: {
          clsName: this.getClassName(),
          mthdName: 'getFeatures/featuresUrl',
        },
      })
      return features
    } catch (err) {
      console.error(err)
      return null
    }
  }

  getDownloadLinks = async () => {
    try {
      const linksUrl = await this.getServiceEndpoint('regioninfo', 'internal')
      const { links } = await this.client.basicGet<any>({
        url: linksUrl,
        options: {
          clsName: this.getClassName(),
          mthdName: 'getDownloadLinks',
        },
      })
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
      const { links } = await this.client.basicGet<GetFeatureLinks>({
        url: linksUrl,
        options: {
          clsName: this.getClassName(),
          mthdName: 'resetCookie/links',
        },
      })
      const token2cookieUrl = links.token2cookie
      const authHeaders = this.client.getAuthHeaders()
      await this.client.rawGet<string>({
        endpoint: token2cookieUrl,
        url: '',
        config: {
          ...authHeaders,
          withCredentials: true,
        },
        options: {
          clsName: this.getClassName(),
          mthdName: 'resetCookie',
        },
      })
    } catch (err) {
      console.warn('Setting session cookie for accessing hostagent rpms failed')
    }
  }

  getRegions = async () => {
    const data = await this.client.basicGet<GetRegions>({
      url: this.regionsUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRegions',
      },
    })
    return data.regions
  }

  // Allow programmatic access
  regions = {
    list: this.getRegions.bind(this),
  }

  getServiceCatalog = async () => {
    const data = await this.client.basicGet<GetServiceCatalog>({
      url: this.catalogUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getServiceCatalog',
      },
    })
    this.client.serviceCatalog = data.catalog
    return data.catalog
  }

  getEndpoints = async () => {
    const data = await this.client.basicGet<any>({
      url: this.endpointsUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getEndpoints',
      },
    })
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
    const data = await this.client.basicGet<GetCredentials>({
      url: this.credentialsUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getCredentials',
      },
    })
    return data.credentials
  }

  getUser = async (id) => {
    const data = await this.client.basicGet<any>({
      url: `${this.usersUrl}/${id}`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getUser',
      },
    })
    return data.user
  }

  getUsers = async () => {
    const data = await this.client.basicGet<GetUsers>({
      url: this.usersUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getUsers',
      },
    })
    return data.users
  }

  createUser = async (params) => {
    const body = { user: params }
    const data = await this.client.basicPost<any>({
      url: this.usersUrl,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createUser',
      },
    })
    return data.user
  }

  updateUser = async (id, params) => {
    const body = { user: params }
    const url = `${this.usersUrl}/${id}`
    const data = await this.client.basicPatch<UpdateUser>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateUser',
      },
    })
    return data.user
  }

  updateUserPassword = async (id, params) => {
    const body = { user: params }
    const url = `${this.usersUrl}/${id}/password`
    const data = await this.client.basicPost<any>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateUserPassword',
      },
    })
    return data.user
  }

  deleteUser = async (userId) => {
    try {
      await this.client.basicDelete<any>({
        url: `${this.usersUrl}/${userId}`,
        options: {
          clsName: this.getClassName(),
          mthdName: 'deleteUser',
        },
      })
      return userId
    } catch (err) {
      throw new Error('Unable to delete non-existant user')
    }
  }
}

export default Keystone
