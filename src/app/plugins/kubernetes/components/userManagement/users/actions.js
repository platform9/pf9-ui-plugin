import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import {
  mngmTenantsCacheKey, filterValidTenants,
} from 'k8s/components/userManagement/tenants/actions'
import {
  partition, pluck, map, head, innerJoin, uniq, prop, pipe, find, propEq, when, isNil, always,
  filter, flatten, groupBy, values, omit, keys, reject,
} from 'ramda'
import { emptyObj, upsertAllBy, emptyArr, pathStr } from 'utils/fp'
import { uuidRegex } from 'app/constants'
import createContextLoader from 'core/helpers/createContextLoader'
import { castBoolToStr } from 'utils/misc'
import { tryCatchAsync } from 'utils/async'

const { keystone } = ApiClient.getInstance()

export const isSystemUser = ({ username }) => {
  return uuidRegex.test(username)
}
export const mngmCredentialsCacheKey = 'managementCredentials'
createContextLoader(mngmCredentialsCacheKey, () => keystone.getCredentials())

const adminUserNames = ['heatadmin', 'admin@platform9.net']
export const mngmUsersCacheKey = 'managementUsers'
export const mngmUserActions = createCRUDActions(mngmUsersCacheKey, {
  listFn: async () => {
    return keystone.getUsers()
  },
  deleteFn: async ({ id }) => {
    mngmUserActions.invalidateCache()
    return keystone.deleteUser(id)
  },
  createFn: async ({ username, displayname, password, roleAssignments }) => {
    const createdUser = await keystone.createUser({
      email: username,
      name: username,
      username,
      displayname,
      password: password || undefined,
      default_project_id: head(keys(roleAssignments)),
    })
    const userTenants = await tryCatchAsync(
      () =>
        Promise.all(Object.entries(roleAssignments).map(([tenantId, roleId]) =>
          keystone.addUserRole({ userId: createdUser.id, tenantId, roleId }),
        )),
      err => {
        console.warn(err.message)
        return emptyArr
      })(null)
    return {
      ...createdUser,
      tenants: userTenants,
    }
  },
  updateFn: async (
    { id: userId, username, displayname, password, roleAssignments },
    prevItems,
    loadFromContext,
  ) => {
    const currentUser = prevItems.find(propEq('id', userId))
    const prevRoleAssignmentsArr = await loadFromContext(mngmUserRoleAssignmentsCacheKey, {
      userId,
    })
    const prevRoleAssignments = prevRoleAssignmentsArr.reduce((acc, roleAssignment) => ({
      ...acc,
      [pathStr('scope.project.id', roleAssignment)]: pathStr('role.id', roleAssignment),
    }), {})
    const mergedTenantIds = keys({ ...prevRoleAssignments, ...roleAssignments })

    // Perform the api calls to update the user and the tenant/role assignments
    const updatedUserPromise = keystone.updateUser(userId, {
      ...omit(['tenants'], currentUser),
      name: username,
      username,
      email: username,
      displayname,
      password: password || undefined,
    })
    const updateTenantRolesPromises = mergedTenantIds.map(tenantId => {
      const prevRoleId = prevRoleAssignments[tenantId]
      const currRoleId = roleAssignments[tenantId]
      if (prevRoleId && !currRoleId) {
        // Remove unselected user/role pair
        return keystone.deleteUserRole({ userId, tenantId, roleId: prevRoleId })
          .then(always(null))
      } else if (!prevRoleId && currRoleId) {
        // Add new user and role
        return keystone.addUserRole({ userId, tenantId, roleId: currRoleId })
      } else if (prevRoleId && currRoleId && prevRoleId !== currRoleId) {
        // Update changed role (delete current and add new)
        return keystone.deleteUserRole({ userId, tenantId, roleId: prevRoleId })
          .then(() => keystone.addUserRole({ userId, tenantId, roleId: currRoleId }))
      }
      return Promise.resolve(null)
    }, [])

    // Resolve tenant and user/roles operation promises and filter out null responses
    const [updatedUser, updatedUserTenants] = await Promise.all([
      updatedUserPromise,
      tryCatchAsync(
        () => Promise.all(updateTenantRolesPromises).then(reject(isNil)),
        err => {
          console.warn(err.message)
          return emptyArr
        })(null),
    ])
    return {
      ...currentUser,
      ...updatedUser,
      tenants: updatedUserTenants,
    }
  },
  dataMapper: async (users, { systemUsers }, loadFromContext) => {
    const [credentials, allTenants] = await Promise.all([
      loadFromContext(mngmCredentialsCacheKey),
      loadFromContext(mngmTenantsCacheKey, { includeBlacklisted: true }),
    ])
    const [validTenants, blacklistedTenants] = partition(filterValidTenants, allTenants)
    const blacklistedTenantIds = pluck('id', blacklistedTenants)

    // Get all tenant users and assign their corresponding tenant ID
    const pluckUsers = map(tenant =>
      tenant.users.map(user => ({
        ...user,
        tenantId: tenant.id,
      })),
    )

    // Unify all users with the same ID
    const unifyTenantUsers = map(groupedUsers => {
      const tenants = innerJoin(
        (tenant, id) => tenant.id === id,
        validTenants,
        uniq(pluck('tenantId', groupedUsers)),
      )
      return {
        ...head(groupedUsers),
        tenants,
        // Get user tenant names and concat them with commas
        tenantNames: tenants.map(prop('name')).join(', '),
      }
    })

    const allUsers = users.map(user => ({
      id: user.id,
      username: user.name,
      displayname: user.displayname,
      email: user.email,
      defaultProject: user.default_project_id,
      twoFactor: pipe(
        find(propEq('user_id', user.id)),
        when(isNil, always(emptyObj)),
        propEq('type', 'totp'),
        castBoolToStr('enabled', 'disabled'),
      )(credentials),
    }))

    const filterUsers = filter(user => {
      return (systemUsers || !isSystemUser(user)) &&
        user.username &&
        !adminUserNames.includes(user.username) &&
        !blacklistedTenantIds.includes(user.defaultProject)
    })

    return pipe(
      pluckUsers,
      flatten,
      groupBy(prop('id')),
      values,
      unifyTenantUsers,
      upsertAllBy(prop('id'), allUsers),
      filterUsers,
    )(validTenants)
  },
})

export const mngmUserRoleAssignmentsCacheKey = 'managementUserRoleAssignments'
export const mngmUserRoleAssignmentsLoader = createContextLoader(mngmUserRoleAssignmentsCacheKey,
  async ({ userId }) => {
    const roleAssignments = await keystone.getUserRoleAssignments(userId) || emptyArr
    return roleAssignments.map(roleAssignment => ({
      ...roleAssignment,
      id: `${pathStr('user.id', roleAssignment)}-${pathStr('role.id', roleAssignment)}`,
    }))
  }, {
    indexBy: 'userId',
  })
