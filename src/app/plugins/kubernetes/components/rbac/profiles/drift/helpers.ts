import { flatten, keys, mergeAll, mergeDeepLeft } from 'ramda'

const apiGroupName = (name) => {
  if (name === '') {
    return 'core'
  }
  return name
}

const processRule = (rule) => {
  const ruleApiGroups = rule.apiGroups.map(apiGroupName)

  const withResources = ruleApiGroups.map((apiGroup) => {
    return { apiGroup, resources: rule.resources, verbs: rule.verbs }
  })

  const withVerbs = withResources.map((item) => {
    // use verb: true format so I can use mergeDeepLeft easily
    const verbsObject = item.verbs.reduce((accum, verb) => ({ ...accum, [verb]: true }), {})
    const verbsByResource = item.resources.reduce((accum, current) => {
      const resourceVerbs = { [current]: verbsObject }
      return { ...accum, ...resourceVerbs }
    }, {})
    return { [item.apiGroup]: verbsByResource }
  })

  const translatedRule = mergeAll(withVerbs)
  return translatedRule
}

export const parseRoleRules = (rules) => {
  const rbac = rules.reduce((accum, current) => {
    const newRules = processRule(current)
    return mergeDeepLeft(accum, newRules)
  }, {})
  return rbac
}

export const numApiResources = (rbac) => {
  const apiGroups = keys(rbac)
  const resources = flatten(apiGroups.map((group) => keys(rbac[group])))
  return resources.length
}
