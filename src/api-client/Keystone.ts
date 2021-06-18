import { head, pipe, pluck, values } from 'ramda'
import { getHighestRole, trackApiMethodMetadata } from './helpers'
import { capitalizeString, pathJoin } from 'utils/misc'
import { pathStr } from 'utils/fp'
import ApiService from 'api-client/ApiService'
import {
  AuthToken,
  Catalog,
  GetAllTenantsAllUsers,
  GetCredentials,
  GetFeatureLinks,
  GetFeatures,
  GetProjectsAuth,
  GetRegions,
  GetRoles,
  GetServiceCatalog,
  GetUserRoleAssignments,
  GetUsers,
  IInterfaceByName,
  ServicesByName,
  ServicesByRegion,
  UpdateProject,
  UpdateUser,
} from './keystone.model'
import DataKeys from 'k8s/DataKeys'
import ApiClient from 'api-client/ApiClient'
import ApiError from 'core/errors/ApiError'

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

const constructAuthFromSaml = (token: string, projectId?: string) => {
  return {
    auth: {
      identity: {
        methods: ['saml2'],
        saml2: {
          id: token,
        },
      },
      scope: {
        project: {
          id: projectId,
        },
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

const constructAuthFromCredentialsWithProjectId = (username, password, projectId) => {
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
      scope: {
        project: {
          id: projectId,
        },
      },
    },
  }
}

const constructAuthFromCredentialsTotp = (username, password, totp) => {
  return {
    auth: {
      identity: {
        methods: ['password', 'totp'],
        password: {
          user: {
            name: username,
            domain: { id: 'default' },
            password,
          },
        },
        totp: {
          user: {
            name: username,
            domain: { id: 'default' },
            passcode: totp,
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

  static apiMethodsMetadata = []

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

  get identityProvidersUrl() {
    return `${this.v3}/OS-FEDERATION/identity_providers`
  }

  get ssoLoginUrl() {
    return `${this.v3}/OS-FEDERATION/identity_providers/IDP1/protocols/saml2/auth`
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

  @trackApiMethodMetadata({ url: '/v3/projects/{projectId}', type: 'GET', params: ['projectId'] })
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

  @trackApiMethodMetadata({ url: '/v3/auth/projects', type: 'GET' })
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

  @trackApiMethodMetadata({ url: '/v3/projects', type: 'GET' })
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

  @trackApiMethodMetadata({ url: '/v3/PF9-KSADM/all_tenants_all_users', type: 'GET' })
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

  @trackApiMethodMetadata({
    url: '/v3/role_assignments?scope.project.id={tenantId}',
    type: 'GET',
    params: ['tenantId'],
  })
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

  @trackApiMethodMetadata({
    url: '/v3/role_assignments?user.id={userId}&include_names={includeNames}',
    type: 'GET',
    params: ['userId', 'includeNames'],
  })
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

  @trackApiMethodMetadata({
    url: '/v3/role_assignments?user.id={userId}&include_names={includeNames}',
    type: 'GET',
    params: ['userId', 'includeNames'],
  })
  getGroupRoleAssignments = async (groupId) => {
    // Todo: typings for this API
    const data = await this.client.basicGet<any>({
      url: this.roleAssignments,
      params: {
        'group.id': groupId,
        include_names: true,
      },
      options: {
        clsName: this.getClassName(),
        mthdName: 'getGroupRoleAssignments',
      },
    })
    return data.role_assignments
  }

  @trackApiMethodMetadata({
    url: '/v3/projects/{tenantId}/users/{userId}/roles/{roleId}',
    type: 'PUT',
    params: ['tenantId', 'userId', 'roleId'],
  })
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

  @trackApiMethodMetadata({
    url: '/v3/projects/{tenantId}/users/{userId}/roles/{roleId}',
    type: 'DELETE',
    params: ['tenantId', 'userId', 'roleId'],
  })
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
      throw new ApiError('Unable to delete non-existant project')
    }
  }

  @trackApiMethodMetadata({
    url: '/v3/OS-FEDERATION/identity_providers/IDP1/protocols',
    type: 'GET',
  })
  getIdpProtocols = async () => {
    const data = await this.client.basicGet<any>({
      url: `${this.identityProvidersUrl}/IDP1/protocols`,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getIdpProtocols',
      },
    })
    return data.protocols
  }

  @trackApiMethodMetadata({
    url: '/v3/OS-FEDERATION/identity_providers/IDP1/protocols/saml2',
    type: 'PUT',
  })
  addIdpProtocol = async (mappingId) => {
    const body = {
      protocol: {
        mapping_id: mappingId,
      },
    }
    // Currently hardcode IDP1 as the idp and saml2 as the protocol until change needed
    const data = await this.client.basicPut<any>({
      url: `${this.identityProvidersUrl}/IDP1/protocols/saml2`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addIdpProtocol',
      },
    })
    return data.protocol
  }

  @trackApiMethodMetadata({ url: '/v3/groups', type: 'GET' })
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

  @trackApiMethodMetadata({ url: '/v3/groups', type: 'POST' })
  createGroup = async (params) => {
    const body = { group: params }
    const data = await this.client.basicPost<any>({
      url: this.groupsUrl,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createGroup',
      },
    })
    return data.group
  }

  @trackApiMethodMetadata({ url: '/v3/groups/{id}', type: 'PATCH', params: ['id'] })
  updateGroup = async (id, params) => {
    const body = { group: params }
    const url = `${this.groupsUrl}/${id}`
    const data = await this.client.basicPatch<any>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateGroup',
      },
    })
    return data.group
  }

  @trackApiMethodMetadata({ url: '/v3/groups/{groupId}', type: 'DELETE', params: ['groupId'] })
  deleteGroup = async (groupId) => {
    try {
      await this.client.basicDelete<any>({
        url: `${this.groupsUrl}/${groupId}`,
        options: {
          clsName: this.getClassName(),
          mthdName: 'deleteGroup',
        },
      })
      return groupId
    } catch (err) {
      throw new ApiError('Unable to delete non-existant group')
    }
  }

  @trackApiMethodMetadata({
    url: '/v3/projects/{tenantId}/groups/{groupId}/roles/{roleId}',
    type: 'PUT',
    params: ['tenantId', 'groupId', 'roleId'],
  })
  addGroupRole = async ({ tenantId, groupId, roleId }) => {
    await this.client.basicPut<string>({
      url: pathJoin(this.projectsUrl, `${tenantId}/groups/${groupId}/roles/${roleId}`),
      body: null,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addGroupRole',
      },
    })
  }

  @trackApiMethodMetadata({
    url: '/v3/projects/{tenantId}/groups/{groupId}/roles/{roleId}',
    type: 'DELETE',
    params: ['tenantId', 'groupId', 'roleId'],
  })
  deleteGroupRole = async ({ tenantId, groupId, roleId }) => {
    try {
      await this.client.basicDelete<any>({
        url: pathJoin(this.projectsUrl, `${tenantId}/groups/${groupId}/roles/${roleId}`),
        options: {
          clsName: this.getClassName(),
          mthdName: 'deleteGroupRole',
        },
      })
      return { tenantId, groupId, roleId }
    } catch (err) {
      throw new ApiError('Unable to delete non-existant role')
    }
  }

  @trackApiMethodMetadata({ url: '/v3/OS-FEDERATION/mappings', type: 'GET' })
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

  @trackApiMethodMetadata({ url: '/v3/OS-FEDERATION/mappings/{id}', type: 'PUT', params: ['id'] })
  createGroupMapping = async (id, params) => {
    const body = { mapping: params }
    const data = await this.client.basicPut<any>({
      url: `${this.groupMappingsUrl}/${id}`,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'createGroupMapping',
      },
    })
    return data.mapping
  }

  @trackApiMethodMetadata({ url: '/v3/OS-FEDERATION/mappings/{id}', type: 'PATCH', params: ['id'] })
  updateGroupMapping = async (id, params) => {
    const body = { mapping: params }
    const url = `${this.groupMappingsUrl}/${id}`
    const data = await this.client.basicPatch<any>({
      url,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'updateGroupMapping',
      },
    })
    return data.mapping
  }

  @trackApiMethodMetadata({
    url: '/v3/OS-FEDERATION/mappings/{id}',
    type: 'DELETE',
    params: ['id'],
  })
  deleteGroupMapping = async (mappingId) => {
    try {
      await this.client.basicDelete<any>({
        url: `${this.groupMappingsUrl}/${mappingId}`,
        options: {
          clsName: this.getClassName(),
          mthdName: 'deleteGroupMapping',
        },
      })
      return mappingId
    } catch (err) {
      throw new ApiError('Unable to delete non-existant group mapping')
    }
  }

  @trackApiMethodMetadata({ url: '/v3/roles', type: 'GET' })
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

  @trackApiMethodMetadata({ url: '/v3/projects', type: 'POST' })
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

  @trackApiMethodMetadata({ url: '/v3/projects/{projectId}', type: 'PATCH', params: ['projectId'] })
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

  @trackApiMethodMetadata({
    url: '/v3/projects/{projectId}',
    type: 'DELETE',
    params: ['projectId'],
  })
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
      throw new ApiError('Unable to delete non-existant project')
    }
  }

  changeProjectScopeWithToken = async (projectId, isSsoToken) => {
    const body = isSsoToken
      ? constructAuthFromSaml(this.client.unscopedToken, projectId)
      : constructAuthFromToken(this.client.unscopedToken, projectId)
    return this.changeProjectScope(projectId, body, 'changeProjectScopeWithToken')
  }

  changeProjectScopeWithCredentials = async (username, password, projectId) => {
    const body = constructAuthFromCredentialsWithProjectId(username, password, projectId)
    return this.changeProjectScope(projectId, body, 'changeProjectScopeWithCredentials')
  }

  changeProjectScope = async (projectId, body, mthdName) => {
    try {
      const response = await this.client.rawPost<AuthToken>({
        url: this.tokensUrl,
        data: body,
        options: {
          clsName: this.getClassName(),
          mthdName,
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
      this.client.activeProjectId = projectId
      this.client.scopedToken = scopedToken
      await this.getServiceCatalog()
      const user = await this.getUser(_user.id)

      await ApiClient.refreshApiEndpoints()

      return {
        user: {
          ...user,
          userId: user.id,
          role: role,
          displayName: user.displayname || user.name,
        },
        role,
        scopedToken,
      }
    } catch (err) {
      // authentication failed
      console.error(err)
      return {}
    }
  }

  authenticate = async (username, password, totp = '') => {
    const body = totp
      ? constructAuthFromCredentialsTotp(username, password, totp)
      : constructAuthFromCredentials(username, password)
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
      console.log(err)
      return {}
    }
  }

  authenticateSso = async () => {
    try {
      const response = await this.client.rawGet<any>({
        url: this.ssoLoginUrl,
        options: {
          clsName: this.getClassName(),
          mthdName: 'authenticateSso',
        },
      })
      const { expires_at: expiresAt, issued_at: issuedAt, user } = response?.data?.token || {}
      const username = user.name || 'Unknown'

      const unscopedToken = response.headers['x-subject-token']
      this.client.unscopedToken = unscopedToken
      return { unscopedToken, username, expiresAt, issuedAt, ssoLogin: true }
    } catch (err) {
      // Redirect to login page manually
      // When implementing hagrid this will be dynamic, get from API
      location.href = '/Shibboleth.sso/Login'
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
      this.client.scopedToken = token
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

  renewScopedToken = async (isSsoToken) => {
    const projectId = this.client.activeProjectId
    const body = isSsoToken
      ? constructAuthFromSaml(this.client.unscopedToken, projectId)
      : constructAuthFromToken(this.client.unscopedToken, projectId)
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
        endpoint: null,
        url: linksUrl,
        options: {
          clsName: this.getClassName(),
          mthdName: 'getFeatures',
        },
      })
      const featuresUrl = links.features
      const timestamp = new Date().getTime()
      const features = await this.client.basicGet<GetFeatures>({
        endpoint: null,
        url: `${featuresUrl}?tag=${timestamp}`,
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
        endpoint: null,
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
        endpoint: null,
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

  @trackApiMethodMetadata({ url: '/v3/regions', type: 'GET' })
  getRegions = async () => {
    const data = await this.client.basicGet<GetRegions>({
      url: this.regionsUrl,
      options: {
        clsName: this.getClassName(),
        mthdName: 'getRegions',
      },
    })
    return data.regions
  };

  // Allow programmatic access
  [DataKeys.Regions] = {
    list: async () => {
      return this.getRegions()
    },
  }

  @trackApiMethodMetadata({ url: '/v3/auth/catalog', type: 'GET' })
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

  @trackApiMethodMetadata({ url: '/v3/endpoints', type: 'GET' })
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
      throw new ApiError(`${capitalizeString(serviceName)} endpoint not available in active region`)
    }
    return endpoint
  }

  @trackApiMethodMetadata({ url: '/v3/credentials', type: 'GET' })
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

  @trackApiMethodMetadata({ url: '/v3/credentials', type: 'POST' })
  addCredential = async (params) => {
    const body = {
      credential: params,
    }
    const data = await this.client.basicPost<any>({
      url: this.credentialsUrl,
      body,
      options: {
        clsName: this.getClassName(),
        mthdName: 'addCredential',
      },
    })
    return data.credential
  }

  @trackApiMethodMetadata({
    url: '/v3/credentials/{credentialId}',
    type: 'DELETE',
    params: ['credentialId'],
  })
  deleteCredential = async (credentialId) => {
    try {
      await this.client.basicDelete<any>({
        url: `${this.credentialsUrl}/${credentialId}`,
        options: {
          clsName: this.getClassName(),
          mthdName: 'deleteCredential',
        },
      })
      return credentialId
    } catch (err) {
      throw new ApiError('Unable to delete non-existent credential')
    }
  }

  @trackApiMethodMetadata({ url: '/v3/users/{userId}', type: 'GET', params: ['userId'] })
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

  @trackApiMethodMetadata({ url: '/v3/users', type: 'GET' })
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

  @trackApiMethodMetadata({ url: '/v3/users', type: 'POST' })
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

  @trackApiMethodMetadata({ url: '/v3/users/{userId}', type: 'PATCH', params: ['userId'] })
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

  @trackApiMethodMetadata({ url: '/v3/users/{userId}/password', type: 'POST', params: ['userId'] })
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

  @trackApiMethodMetadata({ url: '/v3/users/{userId}', type: 'DELETE', params: ['userId'] })
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
      throw new ApiError('Unable to delete non-existant user')
    }
  }
}

export default Keystone
