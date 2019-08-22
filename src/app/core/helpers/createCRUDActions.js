import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { equals, find } from 'ramda'
import { defaultUniqueIdentifier } from 'app/constants'

const createCRUDActions = (options = {}) => {
  const {
    service,
    entity,
    dataKey = entity,
    uniqueIdentifier = defaultUniqueIdentifier,
    operations = ['create', 'list', 'update', 'delete']
  } = options

  return {
    // Wrap standard CRUD operations to include updating the AppContext
    create: find(equals('create'), operations) && createContextUpdater(dataKey, async data => {
      const apiClient = ApiClient.getInstance()
      return apiClient[service][entity].create(data)
    }, { uniqueIdentifier, operation: 'create' }),

    list: find(equals('list'), operations) && createContextLoader(dataKey, async params => {
      const apiClient = ApiClient.getInstance()
      return apiClient[service][entity].list(params)
    }, { uniqueIdentifier }),

    update: find(equals('update'), operations) && createContextUpdater(dataKey, async ({ [uniqueIdentifier]: id, ...data }) => {
      const apiClient = ApiClient.getInstance()
      return apiClient[service][entity].update(id, data)
    }, { uniqueIdentifier, operation: 'update' }),

    delete: find(equals('delete'), operations) && createContextUpdater(dataKey, async ({ [uniqueIdentifier]: id }) => {
      const apiClient = ApiClient.getInstance()
      await apiClient[service][entity].delete(id)
    }, { uniqueIdentifier, operation: 'delete' }),
  }
}

export default createCRUDActions
