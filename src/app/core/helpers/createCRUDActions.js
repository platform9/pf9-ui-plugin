import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

const createCRUDActions = (options = {}) => {
  const {
    service,
    entity,
    dataKey = options.entity,
    uniqueIdentifier = 'id',
  } = options

  return {
    // Wrap standard CRUD operations to include updating the AppContext
    create: contextUpdater(dataKey, async ({ data, context }) => {
      const existing = await context.apiClient[service][entity].list()
      const created = await context.apiClient[service][entity].create(data)
      return [...existing, created]
    }, true),

    list: contextLoader(dataKey, async ({ params, context }) => {
      return context.apiClient[service][entity].list(params)
    }),

    update: contextUpdater(dataKey, async ({ id, data, context }) => {
      const existing = await context.apiClient[service][entity].list()
      const updated = await context.apiClient[service][entity].update(id, data)
      return existing.map(x => x[uniqueIdentifier] === id ? x : updated)
    }),

    delete: contextUpdater(dataKey, async ({ id, context }) => {
      await context.apiClient[service][entity].delete(id)
      return context[dataKey].filter(x => x[uniqueIdentifier] !== id)
    }),
  }
}

export default createCRUDActions
