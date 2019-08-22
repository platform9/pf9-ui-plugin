import { hasPath, path, assocPath, pathEq, always, over, append, view, lensPath } from 'ramda'
import { emptyObj, ensureFunction, removeWith, updateWith, switchCase } from 'utils/fp'
import { dataContextKey, defaultUniqueIdentifier, getContextLoader } from 'core/helpers/createContextLoader'
import { singlePromise } from 'utils/misc'

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
 * @param {function} dataUpdateFn Function whose return value will be used to update the context
 * @param {object} [options] Optional additional options
 * @param {string} [options.uniqueIdentifier="id"] Unique primary key of the entity
 * @param {string} [options.entityName=options.primaryKey] Name of the entity
 * @param {("any"|"create"|"update"|"delete")|string} [options.operation="any"] CRUD operation, it can be "create", "update", "delete" for specific cache adjustments or any custom string to replace the whole cache
 * @param {function|string} [options.successMessage] Custom message to display after context has been updated
 * @param {function|string} [options.errorMessage] Custom message to display after an error has been thrown
 * @returns {function}
 */
const createContextUpdater = (key, dataUpdateFn, options = emptyObj) => {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = key.charAt(0).toUpperCase() + key.slice(1),
    operation = 'any',
    successMessage = (updatedItems, prevItems, params) => `${entityName} item ${switchCase(
      'updated',
      ['create', 'created'],
      ['update', 'updated'],
      ['delete', 'deleted'],
    )(operation)} successfully`,
    errorMessage = (catchedErr, params) => `Error when trying to perform "${switchCase(
      'update',
      ['create', 'create'],
      ['update', 'update'],
      ['delete', 'delete'],
    )(operation)}" operation on ${entityName}`,
  } = options
  const uniqueIdentifierPath = uniqueIdentifier.split('.')
  // Memoize the promise so that we avoid concurrent calls from fetching the api or possible race conditions
  const contextUpdaterFn = singlePromise(async ({ getContext, setContext, params = emptyObj, additionalOptions = emptyObj }) => {
    const {
      onSuccess = (successMessage, params) => console.info(successMessage),
      onError = (errorMessage, catchedErr, params) => console.error(errorMessage, catchedErr),
    } = additionalOptions
    const id = path(uniqueIdentifierPath, params)
    const loaderFn = getContextLoader(key)
    const prevItems = await loaderFn({ getContext, setContext, params, additionalOptions })
    const dataLens = lensPath([dataContextKey, key])

    try {
      const output = await dataUpdateFn(params, prevItems)
      const operationSwitchCase = switchCase(
        // If no operation is chosen (ie "any" or a custom operation), just replace the whole array with the new output
        always(output),
        ['create', append(output)],
        ['update', updateWith(pathEq(uniqueIdentifierPath, id), output)],
        ['delete', removeWith(pathEq(uniqueIdentifierPath, id))],
      )
      await setContext(over(dataLens, operationSwitchCase(operation)))
      const updatedItems = getContext(view(dataLens))

      if (onSuccess) {
        const parsedSuccessMesssage = ensureFunction(successMessage)(updatedItems, prevItems, params)
        await onSuccess(parsedSuccessMesssage, params)
      }
      return updatedItems
    } catch (err) {
      if (onError) {
        const parsedErrorMesssage = ensureFunction(errorMessage)(err, params)
        await onError(parsedErrorMesssage, err, params)
      }
      return prevItems
    }
  }, {
    isDeepEqual: true,
  })
  updaters = assocPath([key, operation], contextUpdaterFn, updaters)
  return contextUpdaterFn
}

export default createContextUpdater
