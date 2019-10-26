import ApiClient from 'api-client/ApiClient'
import {
  any, pluck, pipe, uniq, map, head, values, groupBy, prop, innerJoin, pathEq, flatten, find,
  propEq, filter, when, isNil, always,
} from 'ramda'
import { tryJsonParse } from 'utils/misc'
import { namespacesCacheKey } from 'k8s/components/namespaces/actions'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { upsertAllBy, emptyObj, emptyArr } from 'utils/fp'
import { uuidRegex } from 'app/constants'
import createContextLoader from 'core/helpers/createContextLoader'

const { keystone } = ApiClient.getInstance()

export const mngmTenantsCacheKey = 'managementTenants'
const reservedTenantNames = ['admin', 'services', 'Default', 'heat']
export const mngmTenantActions = createCRUDActions(mngmTenantsCacheKey, {
  listFn: async () => keystone.getAllTenantsAllUsers(),
  dataMapper: async (allTenantsAllUsers, params, loadFromContext) => {
    const namespaces = await loadFromContext(namespacesCacheKey)
    const heatTenantId = pipe(
      find(propEq('name', 'heat')),
      prop('id'),
    )(allTenantsAllUsers)
    return pipe(
      filter(tenant => params.blacklisted
        ? reservedTenantNames.includes(tenant.name)
        : (tenant.domain_id !== heatTenantId && !reservedTenantNames.includes(tenant.name)),
      ),
      map(tenant => ({
        ...tenant,
        users: tenant.users.filter(user => user.username !== 'admin@platform9.net'),
        clusters: pluck('clusterName', namespaces
          .filter(namespace => namespace.metadata.name === tenant.name)),
      })),
    )(allTenantsAllUsers)
  },
})

const isSystemUser = ({ username }) => {
  return uuidRegex.test(username)
}
createContextLoader('credentials', () => keystone.getCredentials())
const adminUserNames = ['heatadmin', 'admin@platform9.net']
export const mngmUsersCacheKey = 'managementUsers'
export const mngmUserActions = createCRUDActions(mngmUsersCacheKey, {
  listFn: async () => {
    return keystone.getUsers()
  },
  dataMapper: async (users, { systemUsers }, loadFromContext) => {
    const [credentials, tenants, blacklistedTenantIds] = await Promise.all([
      loadFromContext('credentials'),
      loadFromContext(mngmTenantsCacheKey),
      loadFromContext(mngmTenantsCacheKey, { blacklisted: true }).then(pluck('id')),
    ])

    // Get all tenant users and assign their corresponding tenant ID
    const pluckUsers = map(tenant =>
      tenant.users.map(user => ({
        ...user,
        tenantId: tenant.id,
      })),
    )

    // Unify all users with the same ID
    const unifyTenantUsers = map(groupedUsers => ({
      ...head(groupedUsers),
      // Get user tenant names and concat them with commas
      tenants: innerJoin(
        (tenant, id) => tenant.id === id,
        tenants,
        uniq(pluck('tenantId', groupedUsers)),
      ).map(prop('name')).join(', '),
    }))

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
        mfaEnabled => mfaEnabled ? 'enabled' : 'disabled',
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
    )(tenants)
  },
})

export const mngmGroupsCacheKey = 'managementGroups'
export const mngmGroupActions = createCRUDActions(mngmGroupsCacheKey, {
  listFn: async () => keystone.getGroups(),
  dataMapper: async (groups, params, loadFromContext) => {
    // Retrieve the group mappings from the cache
    const mappings = await loadFromContext(mngmGroupMappingsCacheKey)
    return groups.map(group => {
      // Find the mapping that contains a rule belonging to the current group
      const groupMapping = mappings.find(mapping => {
        const mappingRules = tryJsonParse(mapping.rules)
        return pipe(
          pluck('local'),
          flatten,
          find(pathEq(['group', 'id'], group.id)),
        )(mappingRules)
      }) || { rules: emptyArr }
      // Filter out the rules not belonging to current group
      const mappingRules = tryJsonParse(groupMapping.rules)
      const groupRules = mappingRules.reduce((groupRules, rule) => {
        if (any(pathEq(['group', 'id'], group.id), rule.local)) {
          // Remove FirsName & LastName mapping from remote attribute array.
          return groupRules.concat(rule.remote.slice(2))
        }
        return groupRules
      }, emptyArr)
      // Stringify the results
      const samlAttributesString = groupRules.reduce((samlAttributes, rule) => {
        if (rule.hasOwnProperty('any_one_of')) {
          return samlAttributes.concat(`${rule.type} = ${rule.any_one_of.join(', ')}`)
        } else if (rule.hasOwnProperty('not_any_of')) {
          return samlAttributes.concat(`${rule.type} != ${rule.not_any_of.join(', ')}`)
        }
        return samlAttributes
      }, emptyArr).join(' AND ')

      return {
        ...group,
        samlAttributesString,
      }
    })
  },
})

export const mngmGroupMappingsCacheKey = 'managementGroupMappings'
export const mngmGroupMappingActions = createCRUDActions(mngmGroupMappingsCacheKey, {
  listFn: async () => keystone.getGroupMappings(),
})

export const mngmRolesCacheKey = 'managementRoles'
export const mngmRoleActions = createCRUDActions(mngmRolesCacheKey, {
  listFn: async () => {
    const roles = await keystone.getRoles()
    return roles.filter(role => ['admin', '_member_'].includes(role.name))
  },
  dataMapper: roles => roles.map(role => ({
    ...role,
    name: role.displayName || role.name,
  })),
})
