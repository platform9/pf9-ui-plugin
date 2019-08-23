import {
  path, pick, isEmpty, concat, identity, assoc, find, whereEq, when, isNil, reject, filter, always,
  append, uniqBy, of, pipe, over, lensPath, pickAll, view, has, equals,
} from 'ramda'
import moize from 'moize'
import { ensureFunction, ensureArray, emptyObj, emptyArr } from 'utils/fp'
import { singlePromise, uncamelizeString } from 'utils/misc'
import { defaultUniqueIdentifier } from 'app/constants'

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
const arrayIfEmpty = when(isEmpty, always(emptyArr))

/**
 * Returns a function that will use context to load and cache values
 * @param {string} key Key on which the resolved value will be cached
 * @param {function} dataFetchFn Function returning the data to be assigned to the context
 * @param {object} [options] Optional additional options
 * @param {string} [options.uniqueIdentifier="id"] Unique primary key of the entity
 * @param {string} [options.entityName=options.uniqueIdentifier] Name of the entity
 * @param {string|array} [options.indexBy] Keys to use to index the values
 * @param {bool} [options.skipEmptyParamCalls=!!options.indexBy] Skip calls that doesn't contain any of the required indexed keys in the params
 * @param {function} [options.dataMapper] Function used to apply additional transformations to the data AFTER being retrieved from cache
 * @param {function|string} [options.successMessage] Custom message to display after the items have been successfully fetched
 * @param {function|string} [options.errorMessage] Custom message to display after an error has been thrown
 * @returns {contextLoaderFn} Function that once called will retrieve data from cache or fetch from server
 */
const createContextLoader = (key, dataFetchFn, options = {}) => {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = uncamelizeString(key).replace(/s$/, ''), // Remove trailing "s"
    indexBy,
    skipEmptyParamCalls = !!indexBy,
    dataMapper = identity,
    successMessage = (params) => `Successfully fetched ${entityName} items`,
    errorMessage = (catchedErr, params) => `Error when trying to fetch ${entityName} items`,
  } = options
  const uniqueIdentifierPath = uniqueIdentifier.split('.')
  const dataLens = lensPath([dataContextKey, key])
  const paramsLens = lensPath([paramsContextKey, key])
  const indexByAll = indexBy ? ensureArray(indexBy) : emptyArr
  // Memoize the data mapper so we will prevent remapping the same items over and over
  const memoizedDataMapper = dataMapper !== identity ? moize(dataMapper, {
    equals, // Use ramda "equals" to prevent SameValueZero comparison which would clean the cache every time
    maxSize: 1, // Only memoize the last resultset of items
    maxArgs: 2, // We don't care about the third argument (loadFromContext) as it shouldn't make any difference
  }) : dataMapper

  /**
   * Context loader function, uses a custom loader function to load data from the server
   * This function promise is memoized so that concurrent calls fetching the api or possible race conditions are avoided
   * @typedef {function} contextLoaderFn
   * @function contextLoaderFn
   * @async
   * @param {Object} args Object containing the required arguments
   * @param {function} args.getContext
   * @param {function} args.setContext
   * @param {object} [args.params] Object containing parameters that will be passed to the updaterFn
   * @param {object} [args.refetch] Invalidates the cache and calls the dataFetchFn() to fetch the data from server
   * @param {object} [args.additionalOptions] Additional custom options
   * @param {function} [args.additionalOptions.onSuccess] Custom logic to perfom after success
   * @param {function} [args.additionalOptions.onError] Custom logic to perfom after error
   * @returns {Promise<array>} Fetched or cached items
   */
  const contextLoaderFn = singlePromise(async ({ getContext, setContext, params = {}, refetch = false, additionalOptions = emptyObj }) => {
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
    if (!refetch && !contextLoaderFn._invalidatedCache) {

      const allCachedParams = getContext(view(paramsLens)) || emptyArr
      if (find(whereEq(indexedParams), allCachedParams)) {
        // Return the cached data
        const cachedItems = getContext(pipe(
          view(dataLens),
          arrayIfNil,
          filter(whereEq(indexedParams)),
          arrayIfEmpty, // Return the constant emptyArr to avoid unnecessary re-renderings
        ))
        return memoizedDataMapper(cachedItems, params, loadFromContext)
      }
    }
    // if refetch = true or no cached params have been found, fetch the items
    try {
      const fetchedItems = await dataFetchFn(params, loadFromContext)

      await setContext(pipe(
        contextLoaderFn._invalidatedCache
          // If cache has been invalidated, empty the cached data array
          ? over(dataLens, always(emptyArr))
          // If we are refetching, we'll clean up the previous queried items
          : (refetch ? over(dataLens, pipe(arrayIfNil, reject(whereEq(indexedParams)))) : identity),
        // Insert new items replacing possible duplicates (by uniqueIdentifier)
        over(dataLens, pipe(arrayIfNil, concat(fetchedItems), uniqBy(path(uniqueIdentifierPath)))),
        // Update cachedParams so that we know this query has already been resolved
        over(paramsLens, pipe(arrayIfNil, contextLoaderFn._invalidatedCache
          ? always(of(indexedParams))
          : append(indexedParams))),
      ))
      contextLoaderFn._invalidatedCache = false
      if (onSuccess) {
        const parsedSuccessMesssage = ensureFunction(successMessage)(params)
        await onSuccess(parsedSuccessMesssage, params)
      }
      return arrayIfEmpty(
        memoizedDataMapper(fetchedItems, params, loadFromContext)
      )
    } catch (err) {
      if (onError) {
        const parsedErrorMesssage = ensureFunction(errorMessage)(err, params)
        await onError(parsedErrorMesssage, err, params)
      }
      return emptyArr
    }
  })
  contextLoaderFn._invalidatedCache = true
  contextLoaderFn.invalidateCache = () => {
    contextLoaderFn._invalidatedCache = true
  }

  if (has(key, loaders)) {
    throw new Error(`Context Loader function with key ${key} already exists`)
  }
  loaders = assoc(key, contextLoaderFn, loaders)
  return contextLoaderFn
}

export default createContextLoader
