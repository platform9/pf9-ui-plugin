import ApiClient from 'api-client/ApiClient'
import createContextLoader from 'core/helpers/createContextLoader'
import createContextUpdater from 'core/helpers/createContextUpdater'
import { defaultUniqueIdentifier } from 'app/constants'
import { mapObjIndexed } from 'ramda'

/**
 * @typedef {object} createCRUDActions~BaseOptions
 * @property {string} [service] API service used to perform the CRUD operations (only required if using automaticaly generated functions)
 * @property {string} [entity] Entity used when auto generating CRUD operations
 * @property {function} [listFn] Function used to fetch data from server, returned data will be stored in the context
 * @property {function} [createFn] Function used to create a new item in the server, return data will be appended to the context
 * @property {function} [updateFn] Function used to update a new item in the server, returned data will be used to update the context
 * @property {function} [deleteFn] Function used to delete an item
 * @property {object} [customOperations] Custom additional operations, the returned value will replace the entire context data array
 */

/**
 * @typedef {createContextLoader~Options & createContextUpdater~Options & createCRUDActions~BaseOptions} createCRUDActions~Options
 */

/**
 * Create CRUD actions
 * @param {string} cacheKey Key on which the resolved value will be cached
 * @param {...createCRUDActions~Options} [options] CRUD options
 * @returns {{(*=): (function), create: function, update: function, list: function, delete: function, invalidateCache: function}}
 */
const createCRUDActions = (cacheKey, options) => {
  const apiClient = ApiClient.getInstance()

  const {
    service,
    entity = cacheKey,
    createFn = async data => service
      ? apiClient[service][entity].create(data)
      : throwErr('create'),
    listFn = async params => service
      ? apiClient[service][entity].list(params)
      : throwErr('list'),
    updateFn = async ({ [uniqueIdentifier]: id, ...data }) => service
      ? apiClient[service][entity].update(id, data)
      : throwErr('update'),
    deleteFn = async ({ [uniqueIdentifier]: id }) => service
      ? apiClient[service][entity].delete(id)
      : throwErr('delete'),
    customOperations = {},
    uniqueIdentifier = defaultUniqueIdentifier,
    ...rest
  } = options

  const contextLoader = createContextLoader(cacheKey, listFn, {
    uniqueIdentifier,
    ...rest,
  })

  const throwErr = operation => () => {
    throw new Error(`"service" option for operation "${operation}" and entity "${entity}" not defined`)
  }

  return {
    // Custom operations
    ...mapObjIndexed((customOperationFn, operation) =>
      createContextUpdater(cacheKey, customOperationFn, {
        uniqueIdentifier,
        operation,
        ...rest,
      }),
    customOperations),

    list: contextLoader,

    create: createContextUpdater(cacheKey, createFn, {
      uniqueIdentifier,
      operation: 'create',
      contextLoader,
      ...rest,
    }),

    update: createContextUpdater(cacheKey, updateFn, {
      uniqueIdentifier,
      operation: 'update',
      contextLoader,
      ...rest,
    }),

    delete: createContextUpdater(cacheKey, deleteFn, {
      uniqueIdentifier,
      operation: 'delete',
      contextLoader,
      ...rest,
    }),

    invalidateCache: contextLoader.invalidateCache,
  }
}

export default createCRUDActions
