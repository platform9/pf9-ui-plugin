import { flatten, mergeAll, mergeDeepLeft, propEq, uniq } from 'ramda'

const processApiGroup = (apiGroup, apiGroupsList) => {
  if (apiGroup === '*') {
    return apiGroupsList.map(group => group.name)
  } else if (apiGroup === '') {
    return ['core']
  } else {
    return [apiGroup]
  }
}

const processApiGroupResources = (apiGroup, rule, apiGroupsList) => {
  const apiGroupFromList = apiGroupsList.find(_apiGroup => (
    _apiGroup.name === apiGroup
  ))
  const resourceNames = apiGroupFromList.resources.map(resource => resource.name)
  const resources = rule.resources.map(resource =>
    resource === '*' ? resourceNames : [resource]
  )
  const flattenedResources = flatten(resources)
  // Account for potential duplicates with wildcard + a specified resource
  // Remove resource if it does not exist in the api group
  const validatedResources = uniq(flattenedResources.filter(resource => resourceNames.includes(resource)))
  return uniq(validatedResources)
}

const processApiGroupVerbs = (item, rule, apiGroupsList) => {
  const apiGroupFromList = apiGroupsList.find(propEq('name', item.apiGroup))
  const resourcesWithVerbs = item.resources.map(resource => {
    const resourceFromList = apiGroupFromList.resources.find(_resource => (
      _resource.name === resource
    ))
    const verbs = rule.verbs.map(verb =>
      verb === '*' ? resourceFromList.verbs : [verb]
    )
    const flattenedVerbs = flatten(verbs)
    // Account for potential duplicates with wildcard + a specified verb
    // Remove verb if it does not exist in the resource
    const validatedVerbs = uniq(flattenedVerbs.filter(verb => {
      return resourceFromList.verbs.includes(verb)
    }))
    return { resource, verbs: validatedVerbs }
  })
  const verbsByResource = resourcesWithVerbs.reduce((accum, current) => {
    const verbsObject = current.verbs.reduce((accum, verb) => ({ ...accum, [verb]: true }), {})
    const resourceVerbs = { [current.resource]: verbsObject }
    return { ...accum, ...resourceVerbs }
  }, {})
  return verbsByResource
}

const processRule = (rule, apiGroups) => {
  const ruleApiGroups = flatten(rule.apiGroups.map(apiGroup => (
    processApiGroup(apiGroup, apiGroups)
  )))

  const withResources = ruleApiGroups.map(apiGroup => {
    const resources = processApiGroupResources(apiGroup, rule, apiGroups)
    return { apiGroup, resources }
  })

  const withVerbs = withResources.map(item => {
    const apiGroupVerbs = processApiGroupVerbs(item, rule, apiGroups)
    return { [item.apiGroup]: apiGroupVerbs }
  })

  const translatedRule = mergeAll(withVerbs)
  return translatedRule
}

const setRbacObject = (rules, apiGroups) => {
  const rbac = rules.reduce((accum, current) => {
    if (current.nonResourceURLs) {
      return accum
    }
    const newRules = processRule(current, apiGroups)
    return mergeDeepLeft(accum, newRules)
  }, {})
  return rbac
}

export default setRbacObject
