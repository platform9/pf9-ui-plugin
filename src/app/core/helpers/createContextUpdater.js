import { hasPath, path, assocPath, propEq, always, over, append, view, lensPath } from 'ramda'
import { emptyObj, ensureFunction, removeWith, updateWith, switchCase } from 'utils/fp'
import { dataKey, defaultUniqueIdentifier, getContextLoader } from 'core/helpers/createContextLoader'
import moize from 'moize'

let updaters = {}

/**
 * Returns a function that will be used to remove or add values from/to existing cached data
 * @param {string} key Key on which the resolved value will be cached
 * @param {function} dataUpdateFn Function whose return value will be used to update the context
 * @param {object} [options] Optional additional options
 * @param {string} [options.uniqueIdentifier="id"] Unique primary key of the entity
 * @param {string} [options.entityName=options.primaryKey] Name of the entity
 * @param {("any"|"create"|"update"|"delete")} [options.operation="any"] CRUD operation
 * @param {function|string} [options.successMessage] Custom message to display after context has been updated
 * @param {function|string} [options.errorMessage] Custom message to display after an error has been thrown
 * @returns {function}
 */
const createContextUpdater = (key, dataUpdateFn, options = emptyObj) => {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
    operation = 'any',
    successMessage = (updatedItems, prevItems, params) => `${entityName} item ${switchCase({
      create: 'created',
      update: 'updated',
      delete: 'deleted',
    }, 'updated')(operation)} successfully`,
    errorMessage = (catchedErr, params) => `Error when trying to perform "${switchCase({
      create: 'create',
      update: 'update',
      delete: 'delete',
    }, `" operation on ${entityName}`)(operation)}`,
  } = options
  const contextUpdaterFn = moize(async ({ getContext, setContext, params = emptyObj, additionalOptions = emptyObj }) => {
    const {
      onSuccess = (successMessage, params) => console.info(successMessage),
      onError = (errorMessage, catchedErr, params) => console.error(errorMessage, catchedErr),
    } = additionalOptions
    const { [uniqueIdentifier]: id } = params
    const loaderFn = getContextLoader(key, getContext, setContext, additionalOptions)
    const prevItems = await loaderFn(params)
    const dataLens = lensPath([dataKey, key])

    try {
      const output = await dataUpdateFn(params, prevItems)
      const getContextSetterFn = switchCase({
        create: append(output),
        update: updateWith(propEq(uniqueIdentifier, id), output),
        delete: removeWith(propEq(uniqueIdentifier, id)),
        // If no operation is chosen (ie "any"), just replace the whole array with the new output
      }, always(output))

      await setContext(over(dataLens, getContextSetterFn(operation)))
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
    isPromise: true,
    isDeepEqual: true,
  })
  updaters = assocPath([key, operation], contextUpdaterFn, updaters)
  return contextUpdaterFn
}

export const getContextUpdater = (key, operation) => {
  if (!hasPath([key, operation || 'any'], updaters)) {
    throw new Error(`Context Updater with key "${key}" and operation "${operation}" not found`)
  }
  return path([key, operation || 'any'], updaters)
}

export default createContextUpdater
