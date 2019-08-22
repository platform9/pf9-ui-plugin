import {
  hasPath, path, assocPath, pathEq, always, over, append, lensPath, pipe, when,
} from 'ramda'
import { emptyObj, ensureFunction, removeWith, updateWith, switchCase } from 'utils/fp'
import { dataContextKey, getContextLoader } from 'core/helpers/createContextLoader'
import { singlePromise, uncamelizeString } from 'utils/misc'
import { defaultUniqueIdentifier } from 'app/constants'

let updaters = {}
export const getContextUpdater = (key, operation) => {
  if (!hasPath([key, operation || 'any'], updaters)) {
    throw new Error(`Context Updater with key "${key}" and operation "${operation}" not found`)
  }
  return path([key, operation || 'any'], updaters)
}

/**
 * Returns a function that will be used to remove or add values from/to existing cached data
 * @param {string} key Key on which the resolved value will be cached
 * @param {function} dataUpdaterFn Function whose return value will be used to update the context
 * @param {object} [options] Optional custom options
 * @param {string} [options.uniqueIdentifier="id"] Unique primary key of the entity
 * @param {string} [options.entityName=options.primaryKey] Name of the entity
 * @param {("create"|"update"|"delete")|string} [options.operation="any"] CRUD operation, it can be "create", "update", "delete" for specific cache adjustments or any custom string to replace the whole cache
 * @param {function|string} [options.successMessage] Custom message to display after context has been updated
 * @param {function|string} [options.errorMessage] Custom message to display after an error has been thrown
 * @returns {contextUpdaterFn} Function that once called will update data from the server and the cache
 */
function createContextUpdater (key, dataUpdaterFn, options = {}) {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = uncamelizeString(key).replace(/s$/, ''), // Remove trailing "s"
    operation = 'any',
    successMessage = (updatedItems, prevItems, params) => `Successfully ${switchCase(
      'updated',
      ['create', 'created'],
      ['update', 'updated'],
      ['delete', 'deleted'],
    )(operation)} ${entityName}`,
    errorMessage = (catchedErr, params) => `Error when trying to "${switchCase(
      'update',
      ['create', 'create'],
      ['update', 'update'],
      ['delete', 'delete'],
    )(operation)}" ${entityName} ${when(
      hasPath(uniqueIdentifierPath),
      pipe(path(uniqueIdentifierPath), id => `with ${uniqueIdentifier}: ${id}`)
    )(params)}`,
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
    const loaderFn = getContextLoader(key)
    const prevItems = await loaderFn(args)

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
        const updatedItems = await loaderFn(args)
        const parsedSuccessMesssage = ensureFunction(successMessage)(updatedItems, prevItems, params)
        await onSuccess(parsedSuccessMesssage, params)
      }
    } catch (err) {
      if (onError) {
        const parsedErrorMesssage = ensureFunction(errorMessage)(err, params)
        await onError(parsedErrorMesssage, err, params)
      }
    }
  }, {
    isDeepEqual: true,
  })

  if (hasPath([key, operation], updaters)) {
    throw new Error(`Context Updater function with key ${key} and operation ${operation} already exists`)
  }
  updaters = assocPath([key, operation], contextUpdaterFn, updaters)
  return contextUpdaterFn
}

export default createContextUpdater
