import { assocPath } from 'ramda'

// This function needs to be modernized, but can be
// done perhaps after kubecon release
const setRbacObject = (rules, apiGroups) => {
  let rbac = {}
  const wildCardRules = []

  rules.map(rule => {
    // UI does not have support for nonResourceURLs
    if (rule.nonResourceURLs) {
      return
    }
    rule.apiGroups.map(apiGroup => {
      rule.resources.map(resource => {
        rule.verbs.map(verb => {
          if (apiGroup === '*' || resource === '*' || verb === '*') {
            wildCardRules.push(rule)
          } else if (apiGroup === '') {
            rbac = assocPath(['core', resource, verb], true, rbac)
          } else {
            rbac = assocPath([apiGroup, resource, verb], true, rbac)
          }
        })
      })
    })
  })

  // Wildcard processing
  if (wildCardRules.length) {
    wildCardRules.map(rule => {
      const apiGroupsWildCard = rule.apiGroups.includes('*')
      const resourcesWildCard = rule.resources.includes('*')
      const verbsWildCard = rule.verbs.includes('*')

      if (apiGroupsWildCard) {
        apiGroups.map(apiGroup => {
          if (resourcesWildCard) {
            // Add all resources that belong to apiGroup
            apiGroup.resources.map(resource => {
              if (verbsWildCard) {
                // Add all verbs that belong to resource
                resource.verbs.map(verb => {
                  rbac = assocPath([apiGroup.name, resource.name, verb], true, rbac)
                })
              } else {
                // Add verbs that belong to rule
                rule.verbs.map(verb => {
                  rbac = assocPath([apiGroup.name, resource.name, verb], true, rbac)
                })
              }
            })
          } else {
            rule.resources.map(resourceName => {
              // Need to get full list of verbs that belong to the
              // resource in case of verbs wildcard
              const resource = apiGroup.resources.find(_resource => (
                _resource.name === resourceName
              ))
              // If resource not in apiGroup, skip resource
              if (!resource) {
                return
              }
              if (verbsWildCard) {
                // Add all verbs that belong to resource
                resource.verbs.map(verb => {
                  rbac = assocPath([apiGroup.name, resource.name, verb], true, rbac)
                })
              } else {
                // Add verbs that belong to rule
                rule.verbs.map(verb => {
                  rbac = assocPath([apiGroup.name, resource.name, verb], true, rbac)
                })
              }
            })
          }
        })
      } else {
        rule.apiGroups.map(apiGroupName => {
          // Need to get full list of resources that belong to
          // apiGroup in case of resources wildcard
          const apiGroup = apiGroups.find(_apiGroup => (
            _apiGroup.name === apiGroupName
          ))
          if (resourcesWildCard) {
            // Add all resources that belong to apiGroup
            apiGroup.resources.map(resource => {
              if (verbsWildCard) {
                // Add all verbs that belong to resource
                resource.verbs.map(verb => {
                  rbac = assocPath([apiGroup.name, resource.name, verb], true, rbac)
                })
              } else {
                // Add verbs that belong to rule
                rule.verbs.map(verb => {
                  rbac = assocPath([apiGroup.name, resource.name, verb], true, rbac)
                })
              }
            })
          } else {
            rule.resources.map(resourceName => {
              // Need to get full list of verbs that belong to the
              // resource in case of verbs wildcard
              const resource = apiGroup.resources.find(_resource => (
                _resource.name === resourceName
              ))
              // If resource not in apiGroup, skip resource
              if (!resource) {
                return
              }
              if (verbsWildCard) {
                // Add all verbs that belong to resource
                resource.verbs.map(verb => {
                  rbac = assocPath([apiGroup.name, resource.name, verb], true, rbac)
                })
              } else {
                // Add verbs that belong to rule
                rule.verbs.map(verb => {
                  rbac = assocPath([apiGroup.name, resource.name, verb], true, rbac)
                })
              }
            })
          }
        })
      }
    })
  }

  return rbac
}

export default setRbacObject
