import ApiClient from 'api-client/ApiClient'
import {
  path, any, pluck, pipe, uniq, reduce, map, head, values, groupBy, prop, innerJoin, pathEq,
  flatten, find,
} from 'ramda'
import { tryJsonParse } from 'utils/misc'
import { namespacesDataKey } from 'k8s/components/namespaces/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'

const { keystone } = ApiClient.getInstance()

export const mngmTenantsDataKey = 'managementTenants'
export const mngmTenantActions = createCRUDActions(mngmTenantsDataKey, {
  listFn: async () => keystone.getAllTenantsAllUsers(),
  dataMapper: async (allTenantsAllUsers, params, loadFromContext) => {
    const namespaces = await loadFromContext(namespacesDataKey)
    return allTenantsAllUsers.map(tenant => ({
      ...tenant,
      clusters: pluck('clusterName', namespaces
        .filter(namespace => namespace.metadata.name === tenant.name)),
    }))
  },
})

export const mngmUsersDataKey = 'managementUsers'
export const mngmUserActions = createCRUDActions(mngmUsersDataKey, {
  listFn: async (params, loadFromContext) => {
    return loadFromContext(mngmTenantsDataKey)
  },
  dataMapper: tenants => {
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
  },
})

export const mngmGroupsDataKey = 'managementGroups'
export const mngmGroupActions = createCRUDActions(mngmGroupsDataKey, {
  listFn: async () => keystone.getGroups(),
  dataMapper: async (groups, params, loadFromContext) => {
    // Retrieve the group mappings from the cache
    const mappings = await loadFromContext(mngmGroupMappingsDataKey)
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
  },
})

export const mngmGroupMappingsDataKey = 'managementGroupMappings'
export const mngmGroupMappingActions = createCRUDActions(mngmGroupMappingsDataKey, {
  listFn: async () => keystone.getGroupMappings(),
})

export const mngmRolesDataKey = 'managementRoles'
export const mngmRoleActions = createCRUDActions(mngmRolesDataKey, {
  listFn: async () => {
    const roles = await keystone.getRoles()
    return roles.filter(role => ['admin', '_member_'].includes(role.name))
  },
  dataMapper: roles => roles.map(role => ({
    ...role,
    name: role.name || role.displayName,
  })),
})
