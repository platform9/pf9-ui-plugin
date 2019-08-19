import { useContext } from 'react'
import { AppContext } from 'core/AppProvider'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'

const createCRUDActions = (options = {}) => {
  const {
    service,
    entity,
    dataKey = options.entity,
    uniqueIdentifier = 'id',
  } = options

  return {
    // Wrap standard CRUD operations to include updating the AppContext
    create: createContextUpdater(dataKey, async data => {
      const { apiClient } = useContext(AppContext)
      return apiClient[service][entity].create(data)
    }, { operation: 'create' }),

    list: createContextLoader(dataKey, async params => {
      const { apiClient } = useContext(AppContext)
      return apiClient[service][entity].list(params)
    }),

    update: createContextUpdater(dataKey, async ({ [uniqueIdentifier]: id, ...data }, currentItems) => {
      const { apiClient } = useContext(AppContext)
      return apiClient[service][entity].update(id, data)
    }, { operation: 'update' }),

    delete: createContextUpdater(dataKey, async ({ [uniqueIdentifier]: id }, currentItems) => {
      const { apiClient } = useContext(AppContext)
      await apiClient[service][entity].delete(id)
    }, { operation: 'delete' }),
  }
}

export default createCRUDActions
