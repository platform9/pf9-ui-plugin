import { createSelector } from 'reselect'
import getDataSelector from 'core/utils/getDataSelector'
import DataKeys from 'k8s/DataKeys'
import { emptyArr } from 'utils/fp'
import { any, find, flatten, pathEq, pipe, pluck } from 'ramda'
import { tryJsonParse } from 'utils/misc'

export const groupsSelector = createSelector(
  [
    getDataSelector<DataKeys.ManagementGroups>(DataKeys.ManagementGroups),
    getDataSelector<DataKeys.ManagementGroupsMappings>(DataKeys.ManagementGroupsMappings),
  ],
  (rawGroups, mappings) => {
    // associate nodes with the combinedHost entry
    return rawGroups.map((group) => {
      // Find the mapping that contains a rule belonging to the current group
      const groupMapping = mappings.find((mapping) => {
        const mappingRules = tryJsonParse(mapping.rules)
        return pipe(pluck('local'), flatten, find(pathEq(['group', 'id'], group.id)))(mappingRules)
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
      const samlAttributesString = groupRules
        .reduce((samlAttributes, rule) => {
          if (rule.hasOwnProperty('any_one_of')) {
            return samlAttributes.concat(`${rule.type} = ${rule.any_one_of.join(', ')}`)
          } else if (rule.hasOwnProperty('not_any_of')) {
            return samlAttributes.concat(`${rule.type} != ${rule.not_any_of.join(', ')}`)
          }
          return samlAttributes
        }, emptyArr)
        .join(' AND ')

      return {
        ...group,
        samlAttributesString,
      }
    })
  },
)
