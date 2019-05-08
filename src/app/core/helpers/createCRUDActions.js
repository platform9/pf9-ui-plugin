import contextLoader from 'core/helpers/contextLoader'
import contextUpdater from 'core/helpers/contextUpdater'

const createCRUDActions = (options = {}) => {
  const {
    service,
    entity,
    dataKey = options.entity,
    uniqueIdentifier = 'id',
    customContextLoader = contextLoader,
    customContextUpdater = contextUpdater,
  } = options

  return {
    // Wrap standard CRUD operations to include updating the AppContext
    create: customContextUpdater(dataKey, async ({ data, apiClient }) => {
      const existing = await apiClient[service][entity].list()
      const created = await apiClient[service][entity].create(data)
      return [...existing, created]
    }, true),

    list: customContextLoader(dataKey, async ({ params, apiClient }) => {
      return apiClient[service][entity].list(params)
    }),

    update: customContextUpdater(dataKey, async ({ id, data, apiClient, currentItems }) => {
      const updated = await apiClient[service][entity].update(id, data)
      return currentItems.map(x => x[uniqueIdentifier] === id ? x : updated)
    }),

    delete: customContextUpdater(dataKey, async ({ id, apiClient, currentItems }) => {
      await apiClient[service][entity].delete(id)
      return currentItems.filter(x => x[uniqueIdentifier] !== id)
    }),
  }
}

export default createCRUDActions
