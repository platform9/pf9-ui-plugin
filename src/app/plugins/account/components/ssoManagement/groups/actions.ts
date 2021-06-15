import Bugsnag from '@bugsnag/js'
import ApiClient from 'api-client/ApiClient'
import { defaultGroupMappingId } from 'app/constants'
// import createContextLoader from 'core/helpers/createContextLoader'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { ActionDataKeys } from 'k8s/DataKeys'
import { always, isNil, keys, reject } from 'ramda'
import { tryCatchAsync } from 'utils/async'
import { emptyArr, pathStr } from 'utils/fp'
import { trackEvent } from 'utils/tracking'
import { formMappingRule } from './helpers'
import { makeGroupsSelector } from './selectors'

const { keystone } = ApiClient.getInstance()
export const mngmGroupActions = createCRUDActions(ActionDataKeys.ManagementGroups, {
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get SSO groups')
    const [groups] = await Promise.all([
      keystone.getGroups(),
      // Fetch dependent caches
      mngmGroupMappingActions.list(),
    ])
    return groups
  },
  createFn: async ({ roleAssignments, ...params }) => {
    Bugsnag.leaveBreadcrumb('Attempting to create SSO group', { ...params })
    const createdGroup = await keystone.createGroup(params)

    await tryCatchAsync(
      () =>
        Promise.all(
          Object.entries(roleAssignments).map(([tenantId, roleId]) =>
            keystone.addGroupRole({ groupId: createdGroup.id, tenantId, roleId }),
          ),
        ),
      (err) => {
        console.warn(err.message)
        return emptyArr
      },
    )(null)
    trackEvent('Create SSO Group', { groupId: createdGroup.id })
    return createdGroup
  },
  updateFn: async ({ groupId, roleAssignments, prevRoleAssignmentsArr, ...params }, prevItems) => {
    Bugsnag.leaveBreadcrumb('Attempting to update SSO group', { groupId, ...params })
    // Not using this loader atm
    // const prevRoleAssignmentsArr = await mngmGroupRoleAssignmentsLoader({
    //   groupId,
    // })
    const prevRoleAssignments = prevRoleAssignmentsArr.reduce(
      (acc, roleAssignment) => ({
        ...acc,
        [pathStr('scope.project.id', roleAssignment)]: pathStr('role.id', roleAssignment),
      }),
      {},
    )
    const mergedTenantIds = keys({ ...prevRoleAssignments, ...roleAssignments })

    // Perform the api calls to update the user and the tenant/role assignments
    const updatedGroupPromise = keystone.updateGroup(groupId, params)
    const updateTenantRolesPromises = mergedTenantIds.map((tenantId) => {
      const prevRoleId = prevRoleAssignments[tenantId]
      const currRoleId = roleAssignments[tenantId]
      if (prevRoleId && !currRoleId) {
        // Remove unselected user/role pair
        return keystone
          .deleteGroupRole({ groupId, tenantId, roleId: prevRoleId })
          .then(always(null))
      } else if (!prevRoleId && currRoleId) {
        // Add new user and role
        return keystone.addGroupRole({ groupId, tenantId, roleId: currRoleId })
      } else if (prevRoleId && currRoleId && prevRoleId !== currRoleId) {
        // Update changed role (delete current and add new)
        return keystone
          .deleteGroupRole({ groupId, tenantId, roleId: prevRoleId })
          .then(() => keystone.addGroupRole({ groupId, tenantId, roleId: currRoleId }))
      }
      return Promise.resolve(null)
    }, [])

    // Resolve tenant and user/roles operation promises and filter out null responses
    const [updatedGroup] = await Promise.all([
      updatedGroupPromise,
      tryCatchAsync(
        () => Promise.all(updateTenantRolesPromises).then(reject(isNil)),
        (err) => {
          console.warn(err.message)
          return emptyArr
        },
      )(null),
    ])
    trackEvent('Update SSO Group', { groupId: groupId })
    return updatedGroup
  },
  deleteFn: async ({ id }) => {
    Bugsnag.leaveBreadcrumb('Attempting to delete SSO group', { groupId: id })
    const groupMappings = await mngmGroupMappingActions.list()
    const mapping = await groupMappings[0]
    const updatedMappingRules = mapping.rules.filter((rule) => id !== rule.local[0]?.group?.id)
    const [success] = await mngmGroupMappingActions.update({
      id: mapping.id,
      rules: updatedMappingRules,
    })
    // What to best do here? Surface an error notification?
    if (!success) {
      console.log('failed to update mapping')
      return
    }
    const result = await keystone.deleteGroup(id)
    trackEvent('Delete SSO Group', { groupId: id })
    return result
  },
  entityName: 'Group',
  uniqueIdentifier: 'id',
  selectorCreator: makeGroupsSelector,
})

export const mngmGroupMappingActions = createCRUDActions(ActionDataKeys.ManagementGroupsMappings, {
  listFn: async () => keystone.getGroupMappings(),
  createFn: async ({ id, ...params }) => await keystone.createGroupMapping(id, params),
  updateFn: async ({ id, ...params }) => await keystone.updateGroupMapping(id, params),
  deleteFn: async ({ id }) => await keystone.deleteGroupMapping(id),
  entityName: 'GroupMappings',
  uniqueIdentifier: 'id',
})

export const loadGroupRoleAssignments = async (groupId) => keystone.getGroupRoleAssignments(groupId)

export const loadIdpProtocols = async () => keystone.getIdpProtocols()

// Not using below at the moment, this loads once and is stored in cache,
// and is never updated again. Setting cache to false or invalidating cache doesn't work
// export const mngmGroupRoleAssignmentsLoader = createContextLoader(
//   ActionDataKeys.ManagementGroupsRoleAssignments,
//   async ({ groupId }) => {
//     const groupRoleAssignments = await keystone.getGroupRoleAssignments(groupId)
//     return groupRoleAssignments || emptyArr
//   },
//   {
//     uniqueIdentifier: ['group.id', 'role.id'],
//     indexBy: 'groupId',
//     cache: false,
//   },
// )

export const groupFormSubmission = async ({
  params,
  existingMapping,
  operation,
  protocolExists,
}) => {
  // Create/update the group and get the group id
  const groupBody = {
    name: params.name,
    description: params.description,
  }
  const groupOperationMap = {
    create: mngmGroupActions.create,
    update: mngmGroupActions.update,
  }
  const groupOperation = groupOperationMap[operation]

  const [success, group] = await groupOperation({
    groupId: params.groupId,
    roleAssignments: params.roleAssignments,
    prevRoleAssignmentsArr: params.prevRoleAssignmentsArr,
    ...groupBody,
  })

  if (!success) {
    console.log('group operation failed')
    return false
  }

  const groupId = group.id

  // Add group to the mapping
  const ruleBody = formMappingRule(params, groupId)
  const mappingBody =
    operation === 'update'
      ? {
          rules: existingMapping.rules.map((rule) => {
            if (rule.local[0].group.id === params.groupId) {
              return ruleBody
            }
            return rule
          }),
        }
      : existingMapping
      ? {
          rules: [...existingMapping.rules, ruleBody],
        }
      : {
          rules: [ruleBody],
        }

  const [updateMappingSuccess] = existingMapping
    ? await mngmGroupMappingActions.update({ id: existingMapping.id, ...mappingBody })
    : await mngmGroupMappingActions.create({ id: defaultGroupMappingId, ...mappingBody })

  if (!updateMappingSuccess) {
    console.log('group mapping operation failed')
  }

  // Link the IDP with the newly created mapping
  if (!protocolExists) {
    await keystone.addIdpProtocol(defaultGroupMappingId)
  }

  return true
}
