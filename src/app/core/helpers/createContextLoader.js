import {
  path, pick, isEmpty, concat, identity, assoc, find, whereEq, when, isNil, reject, filter, always,
  append, uniqBy, of, pipe, over, lensPath, pickAll, view, has, equals, mergeLeft, map, values,
} from 'ramda'
import moize from 'moize'
import { ensureFunction, ensureArray, emptyObj, emptyArr } from 'utils/fp'
import { singlePromise, uncamelizeString } from 'utils/misc'
import { defaultUniqueIdentifier } from 'app/constants'

export const paramsContextKey = 'cachedParams'
export const dataContextKey = 'cachedData'

let loaders = {}
export const getContextLoader = key => {
  return loaders[key]
}
const arrayIfNil = when(isNil, always(emptyArr))
const arrayIfEmpty = when(isEmpty, always(emptyArr))

/**
 * Context Loader options
 * @typedef {object} createContextLoader~Options
 * @property {string} [uniqueIdentifier="id"] Unique primary key of the entity
 * @property {string} [entityName=uniqueIdentifier] Name of the entity
 * @property {string|array} [indexBy] Keys to use to index the values
 * @property {bool} [requiredParams=indexBy] Skip calls that doesn't contain all of the required params
 * @property {function} [preloader] Function that will be called at the beginning so that its result can be used in the dataMapper second argument
 * @property {function} [dataMapper] Function used to apply additional transformations to the data AFTER being retrieved from cache
 * @property {function|string} [fetchSuccessMessage] Custom message to display after the items have been successfully fetched
 * @property {function|string} [fetchErrorMessage] Custom message to display after an error has been thrown
 */

/**
 * Returns a function that will use context to load and cache values
 * @typedef {function} createContextLoader
 * @function createContextLoader
 * @param {string} key Key on which the resolved value will be cached
 * @param {function} dataFetchFn Function returning the data to be assigned to the context
 * @param {...createContextLoader~Options} [options] Optional additional options
 * @returns {contextLoaderFn} Function that once called will retrieve data from cache or fetch from server
 */
const createContextLoader = (key, dataFetchFn, options = {}) => {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = uncamelizeString(key).replace(/s$/, ''), // Remove trailing "s"
    indexBy,
    requiredParams = indexBy,
    dataMapper = identity,
    fetchSuccessMessage = (params) => `Successfully fetched ${entityName} items`,
    fetchErrorMessage = (catchedErr, params) => `Error when trying to fetch ${entityName} items`,
  } = options
  const uniqueIdentifierPath = uniqueIdentifier.split('.')
  const dataLens = lensPath([dataContextKey, key])
  const paramsLens = lensPath([paramsContextKey, key])
  const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr
  const allRequiredParams = requiredParams ? ensureArray(requiredParams) : emptyArr
  // Memoize the data mapper so we will prevent remapping the same items over and over
  const memoizedDataMapper = moize(dataMapper, {
    equals, // Use ramda "equals" to prevent SameValueZero comparison which would clean the cache every time
    maxSize: 1, // Memoize only the last resultset of items
    maxArgs: 2, // We don't care about the third argument (loadFromContext) as it shouldn't make any difference
    // isPromise: true,
  })

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
  const contextLoaderFn = singlePromise(
    async ({ getContext, setContext, params = {}, refetch = false, additionalOptions = emptyObj }) => {
      // If not all the required params are provided, skip this request and just return an empty array
      if (requiredParams && values(pick(allRequiredParams, params)).length < allRequiredParams.length) {
        return emptyArr
      }
      const {
        onSuccess = (successMessage, params) => console.info(successMessage),
        onError = (errorMessage, catchedErr, params) => console.error(errorMessage, catchedErr),
      } = additionalOptions
      const indexedParams = pickAll(allIndexKeys, params)
      const loadFromContext = (key, params, refetch) => {
        const loaderFn = getContextLoader(key)
        return loaderFn({ getContext, setContext, params, refetch, additionalOptions })
      }
      try {
        if (!refetch && !contextLoaderFn._invalidatedCache) {
          const allCachedParams = getContext(view(paramsLens)) || emptyArr
          // If the provided params are already cached
          if (find(whereEq(indexedParams), allCachedParams)) {
            // Return the cached data filtering by the provided params
            const cachedItems = getContext(pipe(
              view(dataLens),
              arrayIfNil,
              // Filter the data by the provided params
              filter(whereEq(indexedParams)),
              // Return the constant emptyArr to avoid unnecessary re-renderings
              arrayIfEmpty,
            ))
            return memoizedDataMapper(cachedItems, params, loadFromContext)
          }
        }
        // if refetch = true or no cached params have been found, fetch the items
        const fetchedItems = await dataFetchFn(params, loadFromContext)

        // Sometimes the server doesn't return the params used for the query
        // so we must add them to the items in order to be able to find them afterwards
        const itemsWithParams = arrayIfEmpty(
          map(mergeLeft(indexedParams), fetchedItems),
        )
        // If cache has been invalidated, empty the cached data array
        const cleanExistingItems = contextLoaderFn._invalidatedCache ? always(emptyArr)
          // Otherwise, if we are refetching, we'll clean up the previous cached items that match the current params
          : (refetch ? pipe(arrayIfNil, reject(whereEq(indexedParams))) : identity)

        // Insert new items replacing possible duplicates (by uniqueIdentifier)
        const addNewItems = pipe(arrayIfNil, concat(itemsWithParams), uniqBy(path(uniqueIdentifierPath)))

        // Update cachedParams so that we know this query has already been resolved
        const updateParams = pipe(arrayIfNil, contextLoaderFn._invalidatedCache
          ? always(of(indexedParams)) // Reset the params array if cache has been invalidated
          : append(indexedParams))

        // Perfom the context update operations
        await setContext(pipe(
          over(dataLens, pipe(cleanExistingItems, addNewItems)),
          over(paramsLens, updateParams),
        ))
        contextLoaderFn._invalidatedCache = false
        if (onSuccess) {
          const parsedSuccessMesssage = ensureFunction(fetchSuccessMessage)(params)
          await onSuccess(parsedSuccessMesssage, params)
        }
        return memoizedDataMapper(itemsWithParams, params, loadFromContext)
      } catch (err) {
        if (onError) {
          const parsedErrorMesssage = ensureFunction(fetchErrorMessage)(err, params)
          await onError(parsedErrorMesssage, err, params)
        }
        return emptyArr
      }
    })
  contextLoaderFn._invalidatedCache = true
  /**
   * Invalidate the current cache
   * Subsequent calls will reset current cache params and data
   * @function
   */
  contextLoaderFn.invalidateCache = () => {
    contextLoaderFn._invalidatedCache = true
  }
  /**
   * Function to retrieve the current dataKey
   * @function
   * @returns {string}
   */
  contextLoaderFn.getKey = () => key

  if (has(key, loaders)) {
    throw new Error(`Context Loader function with key ${key} already exists`)
  }
  loaders = assoc(key, contextLoaderFn, loaders)
  return contextLoaderFn
}

export default createContextLoader
