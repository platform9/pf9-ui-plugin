const createCRUDActions = (options={}) => {
  const {
    service,
    entity,
    dataKey = options.entity,
    uniqueIdentifier = 'id'
  } = options

  return {
    create: async ({ data, context, setContext }) => {
      const existing = await context.apiClient[service][entity].list()
      const created = await context.apiClient[service][entity].create(data)
      setContext({ [dataKey]: [ ...existing, created ] })
      return created
    },

    list: async ({ clusterId, context, setContext, reload }) => {
      if (!reload && context[dataKey]) { return context[dataKey] }
      const entities = await context.apiClient[service][entity].list(clusterId)
      await setContext({ [dataKey]: entities })
      return entities
    },

    update: async ({ id, data, context, setContext }) => {
      const existing = await context.apiClient[service][entity].list()
      const updated = await context.apiClient[service][entity].update(id, data)
      const newList = existing.map(x => x[uniqueIdentifier] === id ? x : updated)
      setContext({ [dataKey]: newList })
    },

    delete: async ({ id, context, setContext }) => {
      await context.apiClient[service][entity].delete(id)
      const newList = context[dataKey].filter(x => x[uniqueIdentifier] !== id)
      setContext({ [dataKey]: newList })
    }
  }
}

export default createCRUDActions
