import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { mngmTenantActions } from 'account/components/userManagement/tenants/actions'
import { makeFilteredUsersSelector } from 'account/components/userManagement/users/selectors'
import { always, find, flatten, head, isNil, keys, pathOr, pipe, prop, propEq, reject } from 'ramda'
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
import { LoginMethodTypes } from './helpers'
import Bugsnag from '@bugsnag/js'
import { trackEvent } from 'utils/tracking'

const { keystone, clemency, setActiveRegion } = ApiClient.getInstance()

const authMethods = {
  [LoginMethodTypes.Local]: async (username, password, totp) =>
    keystone.authenticate(username, password, totp),
  [LoginMethodTypes.SSO]: async (_u, _p, _t) => keystone.authenticateSso(),
}

const reauthenticateUser = async ({ email, currentPassword, currentTenantId }) => {
  const userAuthInfo = await authenticateUser({
    loginUsername: email,
    password: currentPassword,
    loginMethod: LoginMethodTypes.Local,
    MFAcheckbox: false,
    mfa: '',
    reauthenticating: true,
  })

  await updateSession({
    ...userAuthInfo,
    currentTenantId,
    password: currentPassword,
    changeProjectScopeWithCredentials: true,
  })
}

export const authenticateUser = async ({
  loginUsername,
  password,
  loginMethod,
  MFAcheckbox,
  mfa,
  reauthenticating = false,
}) => {
  const totp = MFAcheckbox ? mfa : ''
  const isSsoToken = loginMethod === LoginMethodTypes.SSO

  const { unscopedToken, username, expiresAt, issuedAt } = await authMethods[loginMethod](
    loginUsername,
    password,
    totp,
  )

  if (unscopedToken) {
    const timeDiff = moment(expiresAt).diff(issuedAt)
    const localExpiresAt = moment()
      .add(timeDiff)
      .format()

    if (reauthenticating) {
      store.dispatch(
        sessionActions.updateSession({
          username,
          unscopedToken,
          expiresAt: localExpiresAt,
        }),
      )
    } else {
      store.dispatch(
        sessionActions.initSession({
          username,
          unscopedToken,
          expiresAt: localExpiresAt,
        }),
      )
    }
  }

  return { username, unscopedToken, expiresAt, issuedAt, isSsoToken }
}

export const updateSession = async ({
  username,
  unscopedToken,
  expiresAt,
  issuedAt,
  isSsoToken,
  currentTenantId,
  password = '',
  changeProjectScopeWithCredentials = false,
}) => {
  const timeDiff = moment(expiresAt).diff(issuedAt)
  const localExpiresAt = moment()
    .add(timeDiff)
    .format()

  let user = null
  let scopedToken = null

  if (changeProjectScopeWithCredentials) {
    const response = await keystone.changeProjectScopeWithCredentials(
      username,
      password,
      currentTenantId,
    )
    user = response.user
    scopedToken = response.scopedToken
  } else {
    const response = await keystone.changeProjectScopeWithToken(currentTenantId, isSsoToken)
    user = response.user
    scopedToken = response.scopedToken
  }

  if (scopedToken) {
    await keystone.resetCookie()

    store.dispatch(
      sessionActions.updateSession({
        username,
        unscopedToken,
        scopedToken,
        expiresAt: localExpiresAt,
        userDetails: { ...user },
        isSsoToken,
      }),
    )

    return user
  }

  return null
}

export const credentialActions = createCRUDActions(ActionDataKeys.ManagementCredentials, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get credentials')
    return keystone.getCredentials()
  },
  createFn: async (params) => {
    Bugsnag.leaveBreadcrumb('Attempting to add new credentials')
    const result = await keystone.addCredential(params)
    trackEvent('Add New Credentials')
    return result
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete credential', { id })
    const result = await keystone.deleteCredential(id)
    trackEvent('Delete Credentials', { id })
    return result
  },
  entityName: 'Credential',
})

export const mngmUserActions = createCRUDActions(ActionDataKeys.ManagementUsers, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get users')
    const [users] = await Promise.all([
      keystone.getUsers(),
      // Make sure the derived data gets loaded as well
      credentialActions.list(true),
      mngmTenantActions.list(),
    ])
    return users
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete user', { userId: id })
    await keystone.deleteUser(id)
    // We must invalidate the tenants cache so that they will not contain the deleted user
    mngmTenantActions.invalidateCache()
    trackEvent('Delete User', { userId: id })
  },
  createFn: async ({ username, displayname, password, roleAssignments }) => {
    Bugsnag.leaveBreadcrumb('Attempting to create new user', { username, displayname })
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
          ui_version: 'serenity',
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
    trackEvent('Create New User', { userId: createdUser.id })
    return createdUser
  },
  updateFn: async (
    { id: userId, username, displayname, password, enabled = true, roleAssignments, options },
    prevItems,
  ) => {
    Bugsnag.leaveBreadcrumb('Attempting to update user', { userId })
    // Perform the api calls to update the user and the tenant/role assignments
    const updatedUser = await keystone.updateUser(userId, {
      username,
      name: username,
      email: username,
      displayname,
      password: password || undefined,
      enabled: enabled,
      options: options,
    })

    if (!roleAssignments) {
      return updatedUser
    }

    // Set user roles
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
    trackEvent('Update User', { userId })
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
  async ({ userId }) => {
    Bugsnag.leaveBreadcrumb('Attempting to get user role assignments')
    return (await keystone.getUserRoleAssignments(userId)) || emptyArr
  },
  {
    uniqueIdentifier: ['user.id', 'scope.project.id', 'role.id'],
    indexBy: 'userId',
  },
)

export const updateUserPassword = async ({ id, email, currentPassword, newPassword }) => {
  Bugsnag.leaveBreadcrumb('Attempting to update user password', { userId: id })
  try {
    const state = store.getState()
    const currentTenantId = state[preferencesStoreKey][email].root.currentTenant

    const params = {
      password: newPassword,
      original_password: currentPassword,
    }
    await keystone.updateUserPassword(id, params)
    trackEvent('Update User Password', { userId: id })
    // User must be authenticated again after a password change
    await reauthenticateUser({ email, currentPassword: newPassword, currentTenantId })
  } catch (err) {
    console.warn(err.message)
    return false
  }
  return true
}
