import {
  hasPath, path, assocPath, isNil, pipe, pickAll, reject, either, equals, head, split, prop,
} from 'ramda'
import {
  emptyObj, ensureFunction, switchCase, objSwitchCase, emptyArr, ensureArray,
} from 'utils/fp'
import { getContextLoader } from 'core/helpers/createContextLoader'
import { memoizePromise, uncamelizeString } from 'utils/misc'
import { defaultUniqueIdentifier, notFoundErr, allKey } from 'app/constants'
import { cacheActions, cacheStoreKey, dataCacheKey } from 'core/caching/cacheReducers'
import store from 'app/store'

let updaters = {}
export const getContextUpdater = (key, operation) => {
  return path([key, operation || 'any'], updaters)
}

/**
 * Context Updater options
 *
 * @typedef {object} createContextUpdater~Options
 *
 * @property {string} [uniqueIdentifier="id"] Unique primary key of the entity
 *
 * @property {string} [entityName] Name of the entity, it defaults to the the provided entity "cacheKey"
 * formatted with added spaces and removing the last "s"
 *
 * @property {string|array} [indexBy] Keys to use to index the values
 *
 * @property {("create"|"update"|"delete")|string} [operation="any"] CRUD operation, it can be
 * "create", "update", "delete" for specific cache adjustments or any custom string to
 * replace the whole cache
 *
 * @property {contextLoaderFn} [contextLoader] ContextLoader used to retrieve data from cache
 *
 * @property {function|string} [successMessage] Custom message to display after context has
 * been updated
 *
 * @property {function|string} [errorMessage] Custom message to display after an error has
 * been thrown
 */

/**
 * Returns a function that will be used to remove or add values from/to existing cached data
 *
 * @typedef {function} createContextUpdater
 * @function createContextUpdater
 *
 * @param {string} cacheKey Context key on which the resolved value will be cached
 *
 * @param {function} dataUpdaterFn Function whose return value will be used to update the context
 *
 * @param {...createContextUpdater~Options} [options] Optional custom options
 *
 * @returns {contextUpdaterFn} Function that once called will update data from the server and
 * the cache
 */
function createContextUpdater (cacheKey, dataUpdaterFn, options = {}) {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = uncamelizeString(cacheKey).replace(/s$/, ''), // Remove trailing "s"
    indexBy,
    operation = 'any',
    contextLoader,
    successMessage = (updatedItems, prevItems, params, operation) =>
      `Successfully ${objSwitchCase({
        create: 'created',
        update: 'updated',
        delete: 'deleted',
      }, 'updated')(operation)} ${entityName}`,
    errorMessage = (prevItems, params, catchedErr, operation) => {
      const action = objSwitchCase({
        create: 'create',
        update: 'update',
        delete: 'delete',
      }, 'update')(operation)
      // Display entity ID if available
      const withId = hasPath(head(uniqueIdentifierPaths), params)
        ? ` with ${head(uniqueIdentifierPaths).join('.')}: ${path(head(uniqueIdentifierPaths), params)}`
        : ''
      // Specific error handling
      return switchCase(
        `Error when trying to ${action} ${entityName}${withId}`,
        [notFoundErr, `Unable to find ${entityName}${withId} when trying to ${action}`],
      )(catchedErr.message)
    },
  } = options
  const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr
  const uniqueIdentifierPaths = uniqueIdentifier
    ? ensureArray(uniqueIdentifier).map(split('.'))
    : emptyArr

  /**
   * Context updater function, uses a custom updater function to update the data from the cache,
   * supports CRUD and custom operations
   * This function promise is memoized so that concurrent calls fetching the api or possible race
   * conditions are avoided
   *
   * @typedef {function} contextUpdaterFn
   * @function contextUpdaterFn
   * @async
   *
   * @param {object} [params] Object containing parameters that will be passed to the updaterFn
   *
   * @param {object} [additionalOptions] Additional custom options
   *
   * @param {function} [additionalOptions.onSuccess] Custom logic to perfom after success
   *
   * @param {function} [additionalOptions.onError] Custom logic to perfom after error
   */
  const contextUpdaterFn = memoizePromise(async (
    params = emptyObj,
    additionalOptions = emptyObj,
  ) => {
    const { dispatch, getState } = store
    const cache = prop(cacheStoreKey, getState())
    const { [dataCacheKey]: cachedData } = cache
    const indexedParams = pipe(
      pickAll(allIndexKeys),
      reject(either(isNil, equals(allKey))),
    )(params)
    const {
      onSuccess = (successMessage, params) => console.info(successMessage),
      onError = (errorMessage, catchedErr, params) => console.error(errorMessage, catchedErr),
    } = additionalOptions
    const loader = contextLoader || getContextLoader(cacheKey)
    if (!loader) {
      throw new Error(`Context Loader with key ${cacheKey} not found`)
    }
    const loaderAdditionalOptions = { onError }

    const {
      getDataFilter,
      dataMapper,
    } = loader
    const loadFromContext = (key, params = emptyObj, refetch) => {
      const loaderFn = getContextLoader(key)
      return loaderFn(
        params,
        refetch,
        loaderAdditionalOptions,
      )
    }
    const filterData = getDataFilter(params)
    const cachedItems = filterData(cachedData)
    const prevItems = await dataMapper(cachedItems, params, loadFromContext)

    try {
      const output = await dataUpdaterFn(params, prevItems, loadFromContext)
      switch (operation) {
        case 'create':
          dispatch(cacheActions.addItem({
            cacheKey,
            params: indexedParams,
            item: output,
          }))
          break
        case 'update':
          dispatch(cacheActions.updateItem({
            uniqueIdentifier,
            cacheKey,
            params: indexedParams,
            item: output,
          }))
          break
        case 'delete':
          dispatch(cacheActions.removeItem({
            uniqueIdentifier,
            cacheKey,
            params: indexedParams,
          }))
          break
        default:
          // If no operation is chosen (ie "any" or a custom operation),
          // just replace the whole array with the new output
          dispatch(cacheActions.replaceAll({
            cacheKey,
            items: output,
          }))
      }
      if (onSuccess) {
        const updatedItems = await loader(
          params,
          false,
          loaderAdditionalOptions,
        )
        const parsedSuccessMesssage = ensureFunction(successMessage)(updatedItems, prevItems, params, operation)
        await onSuccess(parsedSuccessMesssage, params)
      }
      return true
    } catch (err) {
      if (onError) {
        const parsedErrorMesssage = ensureFunction(errorMessage)(prevItems, params, err, operation)
        await onError(parsedErrorMesssage, err, params)
      }
      return false
    }
  })
  contextUpdaterFn.cacheKey = cacheKey

  if (hasPath([cacheKey, operation], updaters)) {
    console.warn(`Context Updater function with key ${cacheKey} and operation ${operation} already exists`)
  }
  updaters = assocPath([cacheKey, operation], contextUpdaterFn, updaters)
  return contextUpdaterFn
}

export default createContextUpdater
