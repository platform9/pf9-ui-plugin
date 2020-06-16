import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { mngmTenantActions } from 'k8s/components/userManagement/tenants/actions'
import { always, find, head, isNil, keys, pipe, prop, propEq, reject } from 'ramda'
import { tryCatchAsync } from 'utils/async'
import { emptyArr, objSwitchCase, pathStr } from 'utils/fp'
import { uuidRegex, originUsernameRegex } from 'app/constants'

const { keystone, clemency } = ApiClient.getInstance()

export const isSystemUser = ({ username }) => {
  const { groups = {} } = originUsernameRegex.exec(window.location.origin) || {}
  const { originUsername = null } = groups
  const isOriginUsername = username.includes(originUsername)

  const isUuid = uuidRegex.test(username)
  return isOriginUsername || isUuid || username === 'kplane-clustmgr'
}
export const mngmCredentialsCacheKey = 'managementCredentials'
export const loadCredentials = createContextLoader(
  mngmCredentialsCacheKey,
  () => {
    return keystone.getCredentials()
  },
  {
    requiredRoles: 'admin',
  },
)

export const mngmUsersCacheKey = 'managementUsers'
export const mngmUserActions = createCRUDActions(mngmUsersCacheKey, {
  listFn: async () => {
    const [users] = await Promise.all([
      keystone.getUsers(),
      // Make sure the derived data gets loaded as well
      loadCredentials(true),
      mngmTenantActions.list(),
    ])
    return users
  },
  deleteFn: async ({ id }) => {
    await keystone.deleteUser(id)
    // We must invalidate the tenants cache so that they will not contain the deleted user
    mngmTenantActions.invalidateCache()
  },
  createFn: async ({ username, displayname, password, roleAssignments }) => {
    const defaultTenantId = pipe(keys, head)(roleAssignments)
    const createdUser = password
      ? await keystone.createUser({
          email: username,
          name: username,
          username,
          displayname,
          password: password || undefined,
          default_project_id: defaultTenantId,
        })
      : await clemency.createUser({
          username,
          displayname,
          tenants: defaultTenantId,
        })
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
  ) => {
    const prevRoleAssignmentsArr = await mngmUserRoleAssignmentsLoader({
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
