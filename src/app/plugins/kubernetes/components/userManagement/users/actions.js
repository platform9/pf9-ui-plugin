import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import {
  filterValidTenants,
  mngmTenantActions,
  mngmTenantsCacheKey,
} from 'k8s/components/userManagement/tenants/actions'
import {
  always,
  filter,
  find,
  flatten,
  groupBy,
  head,
  innerJoin,
  isNil,
  keys,
  map,
  omit,
  partition,
  pipe,
  pluck,
  prop,
  propEq,
  reject,
  uniq,
  values,
  when,
} from 'ramda'
import { tryCatchAsync } from 'utils/async'
import { emptyArr, emptyObj, objSwitchCase, pathStr, upsertAllBy } from 'utils/fp'
import { castBoolToStr } from 'utils/misc'
import { uuidRegex, originUsernameRegex } from 'app/constants'
import { trackEvent } from 'utils/tracking'

const { keystone, clemency } = ApiClient.getInstance()

export const isSystemUser = ({ username }) => {
  const { groups = {} } = originUsernameRegex.exec(window.location.origin) || {}
  const { originUsername = null } = groups
  const isOriginUsername = username.includes(originUsername)

  const isUuid = uuidRegex.test(username)
  return isOriginUsername || isUuid || username === 'kplane-clustmgr'
}
export const mngmCredentialsCacheKey = 'managementCredentials'
createContextLoader(
  mngmCredentialsCacheKey,
  () => {
    return keystone.getCredentials()
  },
  {
    requiredRoles: 'admin',
  },
)

const adminUserNames = ['heatadmin', 'admin@platform9.net']
export const mngmUsersCacheKey = 'managementUsers'
export const mngmUserActions = createCRUDActions(mngmUsersCacheKey, {
  listFn: async () => {
    return keystone.getUsers()
  },
  deleteFn: async ({ id }) => {
    await keystone.deleteUser(id)
    // We must invalidate the tenants cache so that they will not contain the deleted user
    mngmTenantActions.invalidateCache()
  },
  createFn: async ({ username, displayname, password, roleAssignments }) => {
    const defaultTenantId = pipe(keys, head)(roleAssignments)
    let createdUser
    if (password) {
      createdUser = await keystone.createUser({
          email: username,
          name: username,
          username,
          displayname,
          password: password || undefined,
          default_project_id: defaultTenantId,
        })
    } else {
      createdUser = await clemency.createUser({
        username,
        displayname,
        tenants: defaultTenantId,
      })
      trackEvent('User Invited', { username, displayname })
    }
    if (createdUser.role === '_member_') {
      return createdUser
    }
    await tryCatchAsync(
      () =>
        Promise.all(
          Object.entries(roleAssignments).map(([tenantId, roleId]) =>
            keystone.addUserRole({ userId: createdUser.id, tenantId, roleId }),
          ),
        ),
      (err) => {
        console.warn(err.message)
        return emptyArr
      },
    )(null)
    // We must invalidate the tenants cache so that they will contain the newly created user
    mngmTenantActions.invalidateCache()
    return createdUser
  },
  updateFn: async (
    { id: userId, username, displayname, password, roleAssignments },
    prevItems,
    loadFromContext,
  ) => {
    const prevRoleAssignmentsArr = await loadFromContext(mngmUserRoleAssignmentsCacheKey, {
      userId,
    })
    const prevRoleAssignments = prevRoleAssignmentsArr.reduce(
      (acc, roleAssignment) => ({
        ...acc,
        [pathStr('scope.project.id', roleAssignment)]: pathStr('role.id', roleAssignment),
      }),
      {},
    )
    const mergedTenantIds = keys({ ...prevRoleAssignments, ...roleAssignments })

    // Perform the api calls to update the user and the tenant/role assignments
    const updatedUserPromise = keystone.updateUser(userId, {
      name: username,
      email: username,
      displayname,
      password: password || undefined,
    })
    const updateTenantRolesPromises = mergedTenantIds.map((tenantId) => {
      const prevRoleId = prevRoleAssignments[tenantId]
      const currRoleId = roleAssignments[tenantId]
      if (prevRoleId && !currRoleId) {
        // Remove unselected user/role pair
        return keystone.deleteUserRole({ userId, tenantId, roleId: prevRoleId }).then(always(null))
      } else if (!prevRoleId && currRoleId) {
        // Add new user and role
        return keystone.addUserRole({ userId, tenantId, roleId: currRoleId })
      } else if (prevRoleId && currRoleId && prevRoleId !== currRoleId) {
        // Update changed role (delete current and add new)
        return keystone
          .deleteUserRole({ userId, tenantId, roleId: prevRoleId })
          .then(() => keystone.addUserRole({ userId, tenantId, roleId: currRoleId }))
      }
      return Promise.resolve(null)
    }, [])

    // Resolve tenant and user/roles operation promises and filter out null responses
    const [updatedUser] = await Promise.all([
      updatedUserPromise,
      tryCatchAsync(
        () => Promise.all(updateTenantRolesPromises).then(reject(isNil)),
        (err) => {
          console.warn(err.message)
          return emptyArr
        },
      )(null),
    ])
    mngmTenantActions.invalidateCache()
    return updatedUser
  },
  dataMapper: async (users, { systemUsers }, loadFromContext) => {
    const [credentials, allTenants] = await Promise.all([
      loadFromContext(mngmCredentialsCacheKey, {}),
      loadFromContext(mngmTenantsCacheKey, { includeBlacklisted: true }),
    ])
    const [validTenants, blacklistedTenants] = partition(filterValidTenants, allTenants)
    const blacklistedTenantIds = pluck('id', blacklistedTenants)

    // Get all tenant users and assign their corresponding tenant ID
    const pluckUsers = map((tenant) =>
      tenant.users.map((user) => ({
        ...user,
        tenantId: tenant.id,
      })),
    )

    // Unify all users with the same ID and group the tenants
    const unifyTenantUsers = map((groupedUsers) => ({
      ...omit(['tenantId'], head(groupedUsers)),
      tenants: innerJoin(
        (tenant, id) => tenant.id === id,
        validTenants,
        uniq(pluck('tenantId', groupedUsers)),
      ),
    }))

    const allUsers = users.map((user) => ({
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

    const filterUsers = filter((user) => {
      return (
        (systemUsers || !isSystemUser(user)) &&
        user.username &&
        !adminUserNames.includes(user.username) &&
        !blacklistedTenantIds.includes(user.defaultProject)
      )
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
  refetchCascade: true,
  entityName: 'User',
  successMessage: (updatedItems, prevItems, { id, username, displayname }, operation) =>
    objSwitchCase({
      create: `User ${displayname || username} created successfully`,
      update: `User ${pipe(
        find(propEq('id', id)),
        prop('username'),
      )(prevItems)} updated successfully`,
      delete: `User ${pipe(
        find(propEq('id', id)),
        prop('username'),
      )(prevItems)} deleted successfully`,
    })(operation),
})

export const mngmUserRoleAssignmentsCacheKey = 'managementUserRoleAssignments'
export const mngmUserRoleAssignmentsLoader = createContextLoader(
  mngmUserRoleAssignmentsCacheKey,
  async ({ userId }) => (await keystone.getUserRoleAssignments(userId)) || emptyArr,
  {
    uniqueIdentifier: ['user.id', 'role.id'],
    indexBy: 'userId',
  },
)
