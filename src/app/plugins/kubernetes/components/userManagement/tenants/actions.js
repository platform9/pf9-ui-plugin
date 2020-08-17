import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import namespaceActions from 'k8s/components/namespaces/actions'
import { mngmUserActions } from 'k8s/components/userManagement/users/actions'
import { always, find, isNil, keys, pipe, prop, propEq, reject } from 'ramda'
import { tryCatchAsync } from 'utils/async'
import { emptyArr, objSwitchCase, pathStr } from 'utils/fp'
import DataKeys from 'k8s/DataKeys'

const { keystone } = ApiClient.getInstance()

export const mngmTenantActions = createCRUDActions(DataKeys.ManagementTenants, {
  listFn: async () => {
    const [allTenantsAllUsers] = await Promise.all([
      keystone.getAllTenantsAllUsers(),
      // Make sure the derived data gets loaded as well
      namespaceActions.list(),
    ])
    return allTenantsAllUsers
  },
  deleteFn: async ({ id }) => {
    await keystone.deleteProject(id)
  },
  createFn: async ({ name, description, roleAssignments }) => {
    const createdTenant = await keystone.createProject({
      name,
      description,
      enabled: true,
      domain_id: 'default',
      is_domain: false,
    })
    const users = await mngmUserActions.list()
    await tryCatchAsync(
      () =>
        Promise.all(
          Object.entries(roleAssignments).map(([userId, roleId]) =>
            keystone.addUserRole({ tenantId: createdTenant.id, userId, roleId }),
          ),
        ),
      (err) => {
        console.warn(err.message)
        return emptyArr
      },
    )(null)
    const userKeys = Object.keys(roleAssignments)
    return {
      ...createdTenant,
      users: users.filter((user) => userKeys.includes(user.id)),
    }
  },
  updateFn: async ({ id: tenantId, name, description, roleAssignments }) => {
    const [users, prevRoleAssignmentsArr] = await Promise.all([
      mngmUserActions.list(DataKeys.ManagementUsers),
      mngmTenantRoleAssignmentsLoader({
        tenantId,
      }),
    ])
    const prevRoleAssignments = prevRoleAssignmentsArr.reduce(
      (acc, roleAssignment) => ({
        ...acc,
        [pathStr('user.id', roleAssignment)]: pathStr('role.id', roleAssignment),
      }),
      {},
    )
    const mergedUserIds = keys({ ...prevRoleAssignments, ...roleAssignments })

    // Perform the api calls to update the tenant and the user/role assignments
    const updateTenantPromise = keystone.updateProject(tenantId, {
      name,
      description,
    })
    const updateUserRolesPromises = mergedUserIds.map((userId) => {
      const prevRoleId = prevRoleAssignments[userId]
      const currRoleId = roleAssignments[userId]
      if (prevRoleId && !currRoleId) {
        // Remove unselected user/role pair
        return keystone.deleteUserRole({ tenantId, userId, roleId: prevRoleId }).then(always(null))
      } else if (!prevRoleId && currRoleId) {
        // Add new user and role
        return keystone.addUserRole({ tenantId, userId, roleId: currRoleId })
      } else if (prevRoleId && currRoleId && prevRoleId !== currRoleId) {
        // Update changed role (delete current and add new)
        return keystone
          .deleteUserRole({ tenantId, userId, roleId: prevRoleId })
          .then(() => keystone.addUserRole({ tenantId, userId, roleId: currRoleId }))
      }
      return Promise.resolve(null)
    }, [])
    // Resolve tenant and user/roles operation promises and filter out null responses
    const [updatedTenant] = await Promise.all([
      updateTenantPromise,
      tryCatchAsync(
        () => Promise.all(updateUserRolesPromises).then(reject(isNil)),
        (err) => {
          console.warn(err.message)
          return emptyArr
        },
      )(null),
    ])
    const userKeys = Object.keys(roleAssignments)
    return {
      ...updatedTenant,
      users: users.filter((user) => userKeys.includes(user.id)),
    }
  },
  refetchCascade: true,
  requiredRoles: 'admin',
  entityName: 'Tenant',
  successMessage: (updatedItems, prevItems, { id, name }, operation) =>
    objSwitchCase({
      create: `Tenant ${name} created successfully`,
      update: `Tenant ${pipe(
        find(propEq('id', id)),
        prop('name'),
      )(prevItems)} updated successfully`,
      delete: `Tenant ${pipe(
        find(propEq('id', id)),
        prop('name'),
      )(prevItems)} deleted successfully`,
    })(operation),
})

export const mngmTenantRoleAssignmentsLoader = createContextLoader(
  DataKeys.ManagementRoleAssignments,
  async ({ tenantId }) => (await keystone.getTenantRoleAssignments(tenantId)) || emptyArr,
  {
    uniqueIdentifier: ['user.id', 'role.id', 'scope.project.id'],
    indexBy: 'tenantId',
  },
)
