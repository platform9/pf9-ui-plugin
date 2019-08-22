import { path, pick, isEmpty, concat, identity, assoc, find, whereEq, when, isNil, reject, filter, always, append, uniqBy, pipe, over, lensPath, pickAll, view } from 'ramda'
import { ensureFunction, ensureArray, emptyObj, emptyArr } from 'utils/fp'
import { singlePromise } from 'utils/misc'

export const defaultUniqueIdentifier = 'uuid'
export const paramsContextKey = 'cachedParams'
export const dataContextKey = 'cachedData'

let loaders = {}
export const getContextLoader = key => {
  if (!loaders.hasOwnProperty(key)) {
    throw new Error(`Context Loader with key ${key} not found`)
  }
  return loaders[key]
}
const arrayIfNil = when(isNil, always(emptyArr))

/**
 * Create a function that will use context to load and cache values
 * @param {string} key Key on which the resolved value will be cached
 * @param {function} dataFetchFn Function returning the data to be assigned to the context
 * @param {object} [options] Optional additional options
 * @param {string} [options.uniqueIdentifier="id"] Unique primary key of the entity
 * @param {string} [options.entityName=options.uniqueIdentifier] Name of the entity
 * @param {string|array} [options.indexBy] Keys to use to index the values
 * @param {bool} [options.skipEmptyParamCalls=!!indexBy] Skip calls that doesn't contain any of the required indexed keys in the params
 * @param {function} [options.dataMapper] Function used to apply additional transformations to loaded data
 * @param {function|string} [options.successMessage] Custom message to display after the items have been successfully fetched
 * @param {function|string} [options.errorMessage] Custom message to display after an error has been thrown
 * @returns {function}
 */
const createContextLoader = (key, dataFetchFn, options = emptyObj) => {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = key.charAt(0).toUpperCase() + key.slice(1),
    indexBy,
    skipEmptyParamCalls = !!indexBy,
    dataMapper = identity,
    successMessage = (params) => `Successfully retrieved ${entityName} items`,
    errorMessage = (catchedErr, params) => `Error when trying to retrieve ${entityName} items`,
  } = options
  const uniqueIdentifierPath = uniqueIdentifier.split('.')
  const paramsLens = lensPath([paramsContextKey, key])
  const dataLens = lensPath([dataContextKey, key])
  const indexByAll = indexBy ? ensureArray(indexBy) : emptyArr
  // Memoize the promise so that we avoid concurrent calls from fetching the api or possible race conditions
  const contextLoaderFn = singlePromise(async ({ getContext, setContext, params = emptyObj, refetch = false, additionalOptions = emptyObj }) => {
    if (skipEmptyParamCalls && isEmpty(pick(indexByAll, params))) {
      return emptyArr
    }
    const {
      onSuccess = (successMessage, params) => console.info(successMessage),
      onError = (errorMessage, catchedErr, params) => console.error(errorMessage, catchedErr),
    } = additionalOptions
    const indexedParams = pickAll(indexByAll, params)
    const loadFromContext = (key, params, refetch) => {
      const loaderFn = getContextLoader(key)
      return loaderFn({ getContext, setContext, params, refetch, additionalOptions })
    }
    if (!refetch) {
      const allCachedParams = getContext(view(paramsLens)) || emptyArr
      if (find(whereEq(indexedParams), allCachedParams)) {
        // Return the cached data
        const cachedItems = getContext(pipe(view(dataLens), arrayIfNil, filter(whereEq(indexedParams))))
        return dataMapper(cachedItems, params, loadFromContext)
      }
    }
    // if refetch = true or no cached params have been found, fetch the items
    try {
      const fetchedItems = await dataFetchFn(params, loadFromContext)

      await setContext(pipe(
        // If we are reloading, we'll clean up the previous queried items first
        refetch ? over(dataLens, pipe(arrayIfNil, reject(whereEq(indexedParams)))) : identity,
        // Insert new items replacing possible duplicates (by uniqueIdentifier)
        over(dataLens, pipe(arrayIfNil, concat(fetchedItems), uniqBy(path(uniqueIdentifierPath)))),
        // Update cachedParams so that we know this query has already been resolved
        over(paramsLens, pipe(arrayIfNil, append(indexedParams)))
      ))
      if (onSuccess) {
        const parsedSuccessMesssage = ensureFunction(successMessage)(params)
        await onSuccess(parsedSuccessMesssage, params)
      }
      return dataMapper(fetchedItems, params, loadFromContext)
    } catch (err) {
      if (onError) {
        const parsedErrorMesssage = ensureFunction(errorMessage)(err, params)
        await onError(parsedErrorMesssage, err, params)
      }
      return emptyArr
    }
  }, {
    isDeepEqual: true,
  })
  loaders = assoc(key, contextLoaderFn, loaders)
  return contextLoaderFn
}

export default createContextLoader
