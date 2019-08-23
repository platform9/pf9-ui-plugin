import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { defaultUniqueIdentifier } from 'app/constants'

const createCRUDActions = options => {
  const {
    service,
    entity,
    dataKey = entity,
    uniqueIdentifier = defaultUniqueIdentifier,
    operations = ['create', 'list', 'update', 'delete'],
    indexBy,
  } = options
  const apiClient = ApiClient.getInstance()
  const throwErr = operation => () => {
    throw new Error(`Operation ${operation} for entity ${entity} not created`)
  }

  return {
    // Wrap standard CRUD operations to include updating the AppContext
    create: operations.includes('create')
      ? createContextUpdater(dataKey,
        async data => apiClient[service][entity].create(data),
        { uniqueIdentifier, operation: 'create' })
      : throwErr('create'),

    list: operations.includes('list')
      ? createContextLoader(dataKey,
        async params => apiClient[service][entity].list(params),
        { uniqueIdentifier, indexBy })
      : throwErr('list'),

    update: operations.includes('update')
      ? createContextUpdater(dataKey,
        async ({ [uniqueIdentifier]: id, ...data }) => apiClient[service][entity].update(id, data),
        { uniqueIdentifier, operation: 'update' })
      : throwErr('update'),

    delete: operations.includes('delete')
      ? createContextUpdater(dataKey,
        async ({ [uniqueIdentifier]: id }) => apiClient[service][entity].delete(id),
        { uniqueIdentifier, operation: 'delete' })
      : throwErr('delete'),
  }
}

export default createCRUDActions
