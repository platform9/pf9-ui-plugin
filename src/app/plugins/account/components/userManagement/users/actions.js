import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import { makeFilteredUsersSelector } from 'account/components/userManagement/users/selectors'
import { always, find, head, isNil, keys, pipe, prop, propEq, reject } from 'ramda'
import { tryCatchAsync } from 'utils/async'
import { emptyArr, objSwitchCase, pathStr } from 'utils/fp'
import { uuidRegex, originUsernameRegex } from 'app/constants'
import { ActionDataKeys } from 'k8s/DataKeys'
import { useDispatch } from 'react-redux'
import store from 'app/store'
import moment from 'moment'
import { sessionActions, sessionStoreKey } from 'core/session/sessionReducers'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { loadUserTenants } from 'openstack/components/tenants/actions'
import { isNilOrEmpty } from 'utils/fp'
import { preferencesStoreKey, preferencesActions } from 'core/session/preferencesReducers'

const { keystone, clemency, setActiveRegion } = ApiClient.getInstance()

export const isSystemUser = ({ username }) => {
  const { groups = {} } = originUsernameRegex.exec(window.location.origin) || {}
  const { originUsername = null } = groups
  const isOriginUsername = username.includes(originUsername)

  const isUuid = uuidRegex.test(username)
  return isOriginUsername || isUuid || username === 'kplane-clustmgr'
}
export const loadCredentials = createContextLoader(
  ActionDataKeys.ManagementCredentials,
  () => {
    return keystone.getCredentials()
  },
  {
    requiredRoles: 'admin',
  },
)

const updateSession = (username, displayName, activeUser) => {
  store.dispatch(
    sessionActions.updateSession({
      username,
      userDetails: { ...activeUser, username, name: username, email: username, displayName },
    }),
  )
}

const updateUserPrefs = (newUsername, oldUserPrefs) => {
  store.dispatch(
    preferencesActions.updateAllPrefs({
      username: newUsername,
      ...oldUserPrefs,
    }),
  )
}

const authenticateUser = async (loginUsername, password) => {
  const { username, unscopedToken, expiresAt, issuedAt } = await keystone.authenticate(
    loginUsername,
    password,
    '',
  )
  const timeDiff = moment(expiresAt).diff(issuedAt)
  const localExpiresAt = moment()
    .add(timeDiff)
    .format()

  const state = store.getState()
  const currentTenant = state[preferencesStoreKey][username].root.currentTenant
  const currentRegion = state[preferencesStoreKey][username].root.currentRegion
  if (currentRegion) {
    setActiveRegion(currentRegion)
  }
  const { scopedToken } = await keystone.changeProjectScope(currentTenant, false)
  store.dispatch(
    sessionActions.updateSession({
      username,
      unscopedToken,
      scopedToken,
      expiresAt: localExpiresAt,
    }),
  )
}

export const mngmUserActions = createCRUDActions(ActionDataKeys.ManagementUsers, {
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
  updateFn: async ({ id: userId, username, displayname, password, roleAssignments }, prevItems) => {
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

    // Get the user's current preferences to transfer to the new username later
    const state = store.getState()
    const oldUsername = state[sessionStoreKey].username
    const oldUserPrefs = state[preferencesStoreKey][oldUsername]

    // Perform the api calls to update the user and the tenant/role assignments
    const updatedUser = await keystone.updateUser(userId, {
      username,
      name: username,
      email: username,
      displayname,
      password: password || undefined,
    })

    // If updating active user, must update the session and user preferences as well
    const activeUser = state[sessionStoreKey].userDetails
    if (userId === activeUser.id) {
      await updateSession(username, displayname, activeUser)
      await updateUserPrefs(username, oldUserPrefs)
      // If updating password of active user, reauthenticate the user
      if (password != undefined) {
        await authenticateUser(username, password)
      }
    }

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
    await tryCatchAsync(
      () => Promise.all(updateTenantRolesPromises).then(reject(isNil)),
      (err) => {
        console.warn(err.message)
        return emptyArr
      },
    )(null)

    mngmTenantActions.invalidateCache()
    // Refresh the user/roles cache
    await mngmUserRoleAssignmentsLoader({ userId }, true)
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
  selectorCreator: makeFilteredUsersSelector,
})

export const mngmUserRoleAssignmentsLoader = createContextLoader(
  ActionDataKeys.ManagementUsersRoleAssignments,
  async ({ userId }) => (await keystone.getUserRoleAssignments(userId)) || emptyArr,
  {
    uniqueIdentifier: ['user.id', 'scope.project.id', 'role.id'],
    indexBy: 'userId',
  },
)
