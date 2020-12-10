export const formMappingRule = (params, groupId) => {
  const customAttributes = params.customMappings.map((mapping) => {
    return {
      type: mapping.attribute,
      [mapping.criteria]: mapping.values.split(',').map((v) => v.trim()),
      regex: !!mapping.regexMatching,
    }
  })
  const newRule = {
    local: [
      {
        user: {
          name: '{0} {1}',
          email: '{2}',
        },
        group: {
          id: groupId,
        },
      },
    ],
    remote: [
      { type: params.firstNameKey },
      { type: params.lastNameKey },
      { type: params.emailKey },
      ...customAttributes,
    ],
  }
  return newRule
}
