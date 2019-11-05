import {
  hasPath, path, assocPath, pathEq, always, over, append, lensPath, identity, isNil, pipe, pickAll,
  reject, either, equals, mergeLeft, allPass, map, head, split, __,
} from 'ramda'
import {
  emptyObj, ensureFunction, removeWith, switchCase, emptyArr, ensureArray, adjustWith,
} from 'utils/fp'
import { dataCacheKey, getContextLoader } from 'core/helpers/createContextLoader'
import { memoizePromise, uncamelizeString } from 'utils/misc'
import { defaultUniqueIdentifier, notFoundErr, allKey } from 'app/constants'

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
    successMessage = (updatedItems, prevItems, params, operation) => `Successfully ${switchCase(
      'updated',
      ['create', 'created'],
      ['update', 'updated'],
      ['delete', 'deleted'],
    )(operation)} ${entityName}`,
    errorMessage = (prevItems, params, catchedErr, operation) => {
      const action = switchCase(
        'update',
        ['create', 'create'],
        ['update', 'update'],
        ['delete', 'delete'],
      )(operation)
      // Display entity ID if available
      const withId = allPass(map(hasPath, uniqueIdentifierPaths), params)
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
  const uniqueIdentifierPaths = uniqueIdentifier ? ensureArray(uniqueIdentifier).map(split('.')) : emptyArr
  const dataLens = lensPath([dataCacheKey, cacheKey])

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
   * @param {Object} args Object containing the required arguments
   *
   * @param {function} args.getContext
   *
   * @param {function} args.setContext
   *
   * @param {object} [args.params] Object containing parameters that will be passed to the updaterFn
   *
   * @param {object} [args.additionalOptions] Additional custom options
   *
   * @param {function} [args.additionalOptions.onSuccess] Custom logic to perfom after success
   *
   * @param {function} [args.additionalOptions.onError] Custom logic to perfom after error
   */
  const contextUpdaterFn = memoizePromise(async ({
    getContext,
    setContext,
    params = emptyObj,
    additionalOptions = emptyObj,
  }) => {
    const {
      onSuccess = (successMessage, params) => console.info(successMessage),
      onError = (errorMessage, catchedErr, params) => console.error(errorMessage, catchedErr),
    } = additionalOptions
    const providedIndexedParams = pipe(
      pickAll(allIndexKeys),
      reject(either(isNil, equals(allKey))),
    )(params)
    const eqIds = allPass(map(idPath => pathEq(idPath, __, params), uniqueIdentifierPaths))
    const loader = contextLoader || getContextLoader(cacheKey)
    if (!loader) {
      throw new Error(`Context Loader with key ${cacheKey} not found`)
    }
    const prevItems = await loader({
      getContext,
      setContext,
      params,
      additionalOptions,
      dumpCache: true,
    })
    const loadFromContext = (key, params = emptyObj, refetch) => {
      const loaderFn = getContextLoader(key)
      return loaderFn({ getContext, setContext, params, refetch, additionalOptions })
    }
    try {
      const output = await dataUpdaterFn(params, prevItems, loadFromContext)
      const operationSwitchCase = switchCase(
        // If no operation is chosen (ie "any" or a custom operation), just replace the whole array with the new output
        isNil(output) ? identity : always(output),
        ['create', append(mergeLeft(providedIndexedParams, output))],
        ['update', adjustWith(eqIds, mergeLeft(output))],
        ['delete', removeWith(eqIds)],
      )
      await setContext(over(dataLens, operationSwitchCase(operation)))

      if (onSuccess) {
        const updatedItems = await loader({
          getContext,
          setContext,
          params,
          additionalOptions,
        })
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
  contextUpdaterFn.getKey = () => cacheKey

  if (hasPath([cacheKey, operation], updaters)) {
    console.warn(`Context Updater function with key ${cacheKey} and operation ${operation} already exists`)
  }
  updaters = assocPath([cacheKey, operation], contextUpdaterFn, updaters)
  return contextUpdaterFn
}

export default createContextUpdater
