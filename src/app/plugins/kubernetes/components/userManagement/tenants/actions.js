import ApiClient from 'api-client/ApiClient'
import { keys, pluck, pipe, prop, find, propEq, filter, always, isNil, reject, omit } from 'ramda'
import { namespacesCacheKey } from 'k8s/components/namespaces/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { filterIf, pathStr, emptyArr } from 'utils/fp'
import createContextLoader from 'core/helpers/createContextLoader'
import { pipeAsync, mapAsync, tryCatchAsync } from 'utils/async'
import { mngmUsersCacheKey } from 'k8s/components/userManagement/users/actions'

const { keystone } = ApiClient.getInstance()

export const mngmTenantsCacheKey = 'managementTenants'

const reservedTenantNames = ['admin', 'services', 'Default', 'heat']
export const filterValidTenants = tenant => !reservedTenantNames.includes(tenant.name)
export const mngmTenantActions = createCRUDActions(mngmTenantsCacheKey, {
  listFn: () => {
    return keystone.getAllTenantsAllUsers()
  },
  deleteFn: async ({ id }) => {
    await keystone.deleteProject(id)
  },
  createFn: async ({ name, description, roleAssignments }, _, loadFromContext) => {
    const createdTenant = await keystone.createProject({
      name,
      description,
      enabled: true,
      domain_id: 'default',
      is_domain: false,
    })
    const users = await loadFromContext(mngmUsersCacheKey)
    await tryCatchAsync(
      () =>
        Promise.all(Object.entries(roleAssignments).map(([userId, roleId]) =>
          keystone.addUserRole({ tenantId: createdTenant.id, userId, roleId }),
        )),
      err => {
        console.warn(err.message)
        return emptyArr
      })(null)
    const userKeys = Object.keys(roleAssignments)
    return {
      ...createdTenant,
      users: users.filter(user => userKeys.includes(user.id)),
    }
  },
  updateFn: async (
    { id: tenantId, name, description, roleAssignments },
    prevItems,
    loadFromContext,
  ) => {
    const currentTenant = prevItems.find(propEq('id', tenantId))
    const [users, prevRoleAssignmentsArr] = await Promise.all([
      loadFromContext(mngmUsersCacheKey),
      loadFromContext(mngmTenantRoleAssignmentsCacheKey, {
        tenantId,
      }),
    ])
    const prevRoleAssignments = prevRoleAssignmentsArr.reduce((acc, roleAssignment) => ({
      ...acc,
      [pathStr('user.id', roleAssignment)]: pathStr('role.id', roleAssignment),
    }), {})
    const mergedUserIds = keys({ ...prevRoleAssignments, ...roleAssignments })

    // Perform the api calls to update the tenant and the user/role assignments
    const updateTenantPromise = keystone.updateProject(tenantId, {
      ...omit(['users'], currentTenant),
      name,
      description,
    })
    const updateUserRolesPromises = mergedUserIds.map(userId => {
      const prevRoleId = prevRoleAssignments[userId]
      const currRoleId = roleAssignments[userId]
      if (prevRoleId && !currRoleId) {
        // Remove unselected user/role pair
        return keystone.deleteUserRole({ tenantId, userId, roleId: prevRoleId })
          .then(always(null))
      } else if (!prevRoleId && currRoleId) {
        // Add new user and role
        return keystone.addUserRole({ tenantId, userId, roleId: currRoleId })
      } else if (prevRoleId && currRoleId && prevRoleId !== currRoleId) {
        // Update changed role (delete current and add new)
        return keystone.deleteUserRole({ tenantId, userId, roleId: prevRoleId })
          .then(() => keystone.addUserRole({ tenantId, userId, roleId: currRoleId }))
      }
      return Promise.resolve(null)
    }, [])
    // Resolve tenant and user/roles operation promises and filter out null responses
    const [updatedTenant] = await Promise.all([
      updateTenantPromise,
      tryCatchAsync(
        () => Promise.all(updateUserRolesPromises).then(reject(isNil)),
        err => {
          console.warn(err.message)
          return emptyArr
        })(null),
    ])
    const userKeys = Object.keys(roleAssignments)
    return {
      ...updatedTenant,
      users: users.filter(user => userKeys.includes(user.id)),
    }
  },
  dataMapper: async (allTenantsAllUsers, params, loadFromContext) => {
    const namespaces = await loadFromContext(namespacesCacheKey, {}, true)
    const heatTenantId = pipe(
      find(propEq('name', 'heat')),
      prop('id'),
    )(allTenantsAllUsers)
    return pipeAsync(
      filterIf(!params.includeBlacklisted, filterValidTenants),
      filter(tenant => tenant.domain_id !== heatTenantId),
      mapAsync(async tenant => ({
        ...tenant,
        users: tenant.users.filter(user => user.username !== 'admin@platform9.net'),
        clusters: pluck('clusterName', namespaces
          .filter(namespace => namespace.metadata.name === tenant.name)),
      })),
    )(allTenantsAllUsers)
  },
  requiredRoles: 'admin',
})

export const mngmTenantRoleAssignmentsCacheKey = 'managementTenantRoleAssignments'
export const mngmTenantRoleAssignmentsLoader = createContextLoader(mngmTenantRoleAssignmentsCacheKey,
  async ({ tenantId }) => (await keystone.getTenantRoleAssignments(tenantId) || emptyArr), {
    uniqueIdentifier: ['user.id', 'role.id'],
    indexBy: 'tenantId',
  })
