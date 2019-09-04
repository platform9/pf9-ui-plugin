import { hasPath, path, assocPath, pathEq, always, over, append, lensPath } from 'ramda'
import { emptyObj, ensureFunction, removeWith, updateWith, switchCase } from 'utils/fp'
import { dataContextKey, getContextLoader } from 'core/helpers/createContextLoader'
import { singlePromise, uncamelizeString } from 'utils/misc'
import { defaultUniqueIdentifier, notFoundErr } from 'app/constants'

let updaters = {}
export const getContextUpdater = (key, operation) => {
  return path([key, operation || 'any'], updaters)
}

/**
 * Context Updater options
 * @typedef {object} createContextUpdater~Options
 * @property {string} [uniqueIdentifier="id"] Unique primary key of the entity
 * @property {string} [entityName=primaryKey] Name of the entity
 * @property {("create"|"update"|"delete")|string} [operation="any"] CRUD operation, it can be "create", "update", "delete" for specific cache adjustments or any custom string to replace the whole cache
 * @property {contextLoaderFn} [contextLoader] ContextLoader used to retrieve data from cache
 * @property {function|string} [successMessage] Custom message to display after context has been updated
 * @property {function|string} [errorMessage] Custom message to display after an error has been thrown
 */

/**
 * Returns a function that will be used to remove or add values from/to existing cached data
 * @typedef {function} createContextUpdater
 * @function createContextUpdater
 * @param {string} key Key on which the resolved value will be cached
 * @param {function} dataUpdaterFn Function whose return value will be used to update the context
 * @param {...createContextUpdater~Options} [options] Optional custom options
 * @returns {contextUpdaterFn} Function that once called will update data from the server and the cache
 */
function createContextUpdater (key, dataUpdaterFn, options = {}) {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = uncamelizeString(key).replace(/s$/, ''), // Remove trailing "s"
    operation = 'any',
    contextLoader,
    successMessage = (updatedItems, prevItems, params, operation) => `Successfully ${switchCase(
      'updated',
      ['create', 'created'],
      ['update', 'updated'],
      ['delete', 'deleted'],
    )(operation)} ${entityName}`,
    errorMessage = (catchedErr, params, operation) => {
      const action = switchCase(
        'update',
        ['create', 'create'],
        ['update', 'update'],
        ['delete', 'delete'],
      )(operation)
      // Display entity ID if available
      const withId = hasPath(uniqueIdentifierPath, params)
        ? ` with ${uniqueIdentifier}: ${path(uniqueIdentifierPath)}`
        : ''
      // Specific error handling
      return switchCase(
        `Error when trying to ${action} ${entityName}${withId}`,
        [notFoundErr, `Unable to find ${entityName}${withId} when trying to ${action}`],
      )(catchedErr.message)
    },
  } = options
  const uniqueIdentifierPath = uniqueIdentifier.split('.')
  const dataLens = lensPath([dataContextKey, key])

  /**
   * Context updater function, uses a custom updater function to update the data from the cache, supports CRUD and custom operations
   * This function promise is memoized so that concurrent calls fetching the api or possible race conditions are avoided
   * @typedef {function} contextUpdaterFn
   * @function contextUpdaterFn
   * @async
   * @param {Object} args Object containing the required arguments
   * @param {function} args.getContext
   * @param {function} args.setContext
   * @param {object} [args.params] Object containing parameters that will be passed to the updaterFn
   * @param {object} [args.additionalOptions] Additional custom options
   * @param {function} [args.additionalOptions.onSuccess] Custom logic to perfom after success
   * @param {function} [args.additionalOptions.onError] Custom logic to perfom after error
   */
  const contextUpdaterFn = singlePromise(async args => {
    const { setContext, params = {}, additionalOptions = emptyObj } = args
    const {
      onSuccess = (successMessage, params) => console.info(successMessage),
      onError = (errorMessage, catchedErr, params) => console.error(errorMessage, catchedErr),
    } = additionalOptions
    const id = path(uniqueIdentifierPath, params)
    const loader = contextLoader || getContextLoader(key)
    if (!loader) {
      throw new Error(`Context Loader with key ${key} not found`)
    }
    const prevItems = await loader(args)

    try {
      const output = await dataUpdaterFn(params, prevItems)
      const operationSwitchCase = switchCase(
        // If no operation is chosen (ie "any" or a custom operation), just replace the whole array with the new output
        always(output),
        ['create', append(output)],
        ['update', updateWith(pathEq(uniqueIdentifierPath, id), output)],
        ['delete', removeWith(pathEq(uniqueIdentifierPath, id))],
      )
      await setContext(over(dataLens, operationSwitchCase(operation)))

      if (onSuccess) {
        const updatedItems = await loader(args)
        const parsedSuccessMesssage = ensureFunction(successMessage)(updatedItems, prevItems, params, operation)
        await onSuccess(parsedSuccessMesssage, params)
      }
    } catch (err) {
      if (onError) {
        const parsedErrorMesssage = ensureFunction(errorMessage)(err, params, operation)
        await onError(parsedErrorMesssage, err, params)
      }
    }
  })
  contextUpdaterFn.getKey = () => key

  if (hasPath([key, operation], updaters)) {
    console.warn(`Context Updater function with key ${key} and operation ${operation} already exists`)
  }
  updaters = assocPath([key, operation], contextUpdaterFn, updaters)
  return contextUpdaterFn
}

export default createContextUpdater
