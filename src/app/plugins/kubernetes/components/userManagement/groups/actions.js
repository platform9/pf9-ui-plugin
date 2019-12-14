import ApiClient from 'api-client/ApiClient'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { tryJsonParse } from 'utils/misc'
import { pipe, pluck, flatten, find, pathEq, any } from 'ramda'
import { emptyArr } from 'utils/fp'

const { keystone } = ApiClient.getInstance()

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
  entityName: 'Group',
})
export const mngmGroupMappingsCacheKey = 'managementGroupMappings'
export const mngmGroupMappingActions = createCRUDActions(mngmGroupMappingsCacheKey, {
  listFn: async () => keystone.getGroupMappings(),
})
