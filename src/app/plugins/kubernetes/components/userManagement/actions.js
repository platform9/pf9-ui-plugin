import ApiClient from 'api-client/ApiClient'
import {
  path, any, pluck, pipe, uniq, reduce, map, head, values, groupBy, prop, innerJoin, pathEq,
  flatten, find,
} from 'ramda'
import { tryJsonParse } from 'utils/misc'
import createContextLoader from 'core/helpers/createContextLoader'
import { namespacesDataKey } from 'k8s/components/namespaces/actions'

export const mngmTenantsDataKey = 'mngmTenants'
export const mngmUsersDataKey = 'mngmUsers'
export const mngmGroupsDataKey = 'mngmGroups'
export const mngmRolesDataKey = 'mngmRoles'

export const loadTenants = createContextLoader(mngmTenantsDataKey, async (params, loadFromContext) => {
  const { keystone } = ApiClient.getInstance()
  const [namespaces, allTenantsAllUsers] = await Promise.all([
    loadFromContext(namespacesDataKey),
    keystone.getAllTenantsAllUsers()
  ])
  return allTenantsAllUsers.map(tenant => ({
    ...tenant,
    clusters: pluck('clusterName', namespaces
      .filter(namespace => namespace.metadata.name === tenant.name)),
  }))
})

export const deleteTenant = () => {
  console.log('TODO')
}

export const loadUsers = createContextLoader(mngmUsersDataKey, async (params, loadFromContext) => {
  const tenants = await loadFromContext(mngmTenantsDataKey)

  // Get all tenant users and assign the corresponding tenant ID
  const selectAllTenantUsers = reduce((acc, tenant) => {
    const tenantUsers = tenant.users.map(user => ({
      ...user,
      tenantId: tenant.id,
    }))
    return acc.concat(tenantUsers)
  }, [])

  // Unify all users with the same ID
  const unifyUsers = map(groupedUsers => ({
    ...head(groupedUsers),
    two_factor: path(['mfa', 'enabled'], head(groupedUsers)) ? 'enabled' : 'disabled',
    // Get user tenant names and concat them with commas
    tenants: innerJoin(
      (tenant, id) => tenant.id === id,
      tenants,
      uniq(pluck('tenantId', groupedUsers)),
    ).map(prop('name')).join(', '),
  }))

  return pipe(
    selectAllTenantUsers,
    groupBy(prop('id')),
    values,
    unifyUsers,
  )(tenants)
})

export const deleteUser = () => {
  console.log('TODO')
}

export const loadGroups = createContextLoader(mngmGroupsDataKey, async () => {
  const { keystone } = ApiClient.getInstance()
  const [groups, mappings] = await Promise.all([
    keystone.getGroups(),
    keystone.getGroupMappings(),
  ])

  return groups.map(group => {
    // Find the mapping that contains a rule belonging to the current group
    const groupMapping = mappings.find(mapping => {
      const mappingRules = tryJsonParse(mapping.rules)
      return pipe(
        pluck('local'),
        flatten,
        find(pathEq(['group', 'id'], group.id)),
      )(mappingRules)
    }) || { rules: [] }
    // Filter out the rules not belonging to current group
    const mappingRules = tryJsonParse(groupMapping.rules)
    const groupRules = mappingRules.reduce((groupRules, rule) => {
      if (any(pathEq(['group', 'id'], group.id), rule.local)) {
        // Remove FirsName & LastName mapping from remote attribute array.
        return groupRules.concat(rule.remote.slice(2))
      }
      return groupRules
    }, [])
    // Stringify the results
    const samlAttributesString = groupRules.reduce((samlAttributes, rule) => {
      if (rule.hasOwnProperty('any_one_of')) {
        return samlAttributes.concat(`${rule.type} = ${rule.any_one_of.join(', ')}`)
      } else if (rule.hasOwnProperty('not_any_of')) {
        return samlAttributes.concat(`${rule.type} != ${rule.not_any_of.join(', ')}`)
      }
      return samlAttributes
    }, []).join(' AND ')

    return {
      ...group,
      samlAttributesString,
    }
  })
})

export const deleteGroup = () => {
  console.log('TODO')
}

export const loadRoles = createContextLoader(mngmRolesDataKey, async () => {
  const { keystone } = ApiClient.getInstance()
  const roles = await keystone.getRoles()

  return roles
    .filter(role => ['admin', '_member_'].includes(role.name))
    .map(role => ({
      ...role,
      name: role.name || role.displayName,
    }))
})

export const deleteRole = () => {
  console.log('TODO')
}
