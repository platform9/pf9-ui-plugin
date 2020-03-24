import {
  pick, identity, assoc, find, whereEq, when, isNil, reject, filter, pipe, pickAll, has, equals,
  values, either, sortBy, reverse, mergeLeft, map, toLower, is, head, prop,
} from 'ramda'
import moize from 'moize'
import {
  ensureFunction, ensureArray, emptyObj, emptyArr, pathStr, arrayIfEmpty, stringIfNil, arrayIfNil,
} from 'utils/fp'
import { memoizePromise, uncamelizeString } from 'utils/misc'
import { defaultUniqueIdentifier, allKey } from 'app/constants'
import {
  paramsCacheKey, dataCacheKey, cacheActions, cacheStoreKey,
} from 'core/caching/cacheReducers'
import store from 'app/store'

let loaders = {}
export const getContextLoader = (key) => {
  return loaders[key]
}
export const invalidateLoadersCache = () => {
  Object.values(loaders).forEach((loader) => loader.invalidateCache())
}

/**
 * Context Loader options
 *
 * @typedef {object} createContextLoader~Options
 *
 * @property {string|array} [uniqueIdentifier="id"] Unique primary key of the entity
 *
 * @property {string} [entityName] Name of the entity, it defaults to the the provided entity "cacheKey"
 * formatted with added spaces and removing the last "s"
 *
 * @property {string|array} [indexBy] Keys to use to index the values
 *
 * @property {string|array} [requiredParams=indexBy] Skip calls that doesn't contain all of the
 * required params, in which case an empty array will be returned
 *
 * @property {function} [preloader] Function that will be called at the beginning so that its
 * result can be used in the dataMapper second argument
 *
 * @property {function} [dataMapper] Function used to apply additional transformations to the data
 * AFTER being retrieved from cache
 *
 * @property {bool} [refetchCascade=false] Indicate wether or not to refetch all the resources
 * loaded using `loadFromContext` in the loader or mapper functions
 *
 * @property {string|array} [requiredRoles] Role or roles that the user must have in order for the data to be fetched
 * If the user doesn't have any of the provided roles then an empty array will be returned
 *
 * @property {string} [defaultOrderBy=uniqueIdentifier] ID of the field that will be used to sort the returned items
 *
 * @property {string} [defaultOrderDirection='asc'] Sorting direction (asc/desc)
 *
 * @property {function} [sortWith] Function used to sort the data after being parsed by the
 * dataMapper
 *
 * @property {function|string} [fetchSuccessMessage] Custom message to display after the items have
 * been successfully fetched
 *
 * @property {function|string} [fetchErrorMessage] Custom message to display after an error has
 * been thrown
 */

/**
 * Returns a function that will use context to load and cache values
 *
 * @typedef {function} createContextLoader
 * @function createContextLoader
 *
 * @param {string} cacheKey Context key on which the resolved value will be cached
 *
 * @param {function} dataFetchFn Function returning the data to be assigned to the context
 *
 * @param {...createContextLoader~Options} [options] Optional additional options
 *
 * @returns {contextLoaderFn} Function that once called will retrieve data from cache or
 * fetch from server
 */
const createContextLoader = (cacheKey, dataFetchFn, options = {}) => {
  const {
    uniqueIdentifier = defaultUniqueIdentifier,
    entityName = uncamelizeString(cacheKey).replace(/s$/, ''), // Remove trailing "s"
    indexBy,
    requiredParams = indexBy,
    dataMapper = identity,
    refetchCascade = false,
    defaultOrderBy = head(ensureArray(uniqueIdentifier)),
    defaultOrderDirection = 'asc',
    sortWith = (items, { orderBy = defaultOrderBy, orderDirection = defaultOrderDirection }) =>
      pipe(
        sortBy(pipe(pathStr(orderBy), stringIfNil, when(is(String), toLower))),
        orderDirection === 'asc' ? identity : reverse,
      )(items),
    fetchSuccessMessage = (params) => `Successfully fetched ${entityName} items`,
    fetchErrorMessage = (catchedErr, params) => `Unable to fetch ${entityName} items`,
  } = options
  const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr
  const allRequiredParams = requiredParams ? ensureArray(requiredParams) : emptyArr
  // Memoize the data mapper so we will prevent remapping the same items over and over
  const memoizedDataMapper = moize(dataMapper, {
    equals, // Use ramda "equals" to prevent SameValueZero comparison which would clean the cache every time
    maxSize: 1, // Memoize only the last resultset of items
    maxArgs: 2, // We don't care about the third argument (loadFromContext) as it shouldn't make any difference
    // isPromise: true,
  })
  const getDataFilter = moize(params => {
    const providedIndexedParams = pipe(
      pickAll(allIndexKeys),
      reject(either(isNil, equals(allKey))),
    )(params)

    return pipe(
      prop(cacheKey),
      arrayIfNil,
      // Filter the data by the provided params
      filter(whereEq(providedIndexedParams)),
      // Return the constant emptyArr to avoid unnecessary re-renderings
      arrayIfEmpty,
    )
  }, { equals })
  const invalidateCacheSymbol = Symbol('invalidateCache')
  const invalidateCascadeSymbol = Symbol('invalidateCache')

  /**
   * Context loader function, uses a custom loader function to load data from the server
   * This function promise is memoized so that concurrent calls fetching the api or possible race
   * conditions are avoided
   *
   * @typedef {function} contextLoaderFn
   * @function contextLoaderFn
   * @async
   *
   * @param {object} [params] Object containing parameters that will be passed to the updaterFn
   *
   * @param {object} [refetch] Invalidates the cache and calls the dataFetchFn() to fetch the
   * data from server
   *
   * @param {object} [additionalOptions] Additional custom options
   *
   * @param {function} [additionalOptions.onSuccess] Custom logic to perfom after success
   *
   * @param {function} [additionalOptions.onError] Custom logic to perfom after error
   *
   * @returns {Promise<array>} Fetched or cached items
   */
  const contextLoaderFn = memoizePromise(
    async (params = emptyObj, refetch = contextLoaderFn[invalidateCacheSymbol], additionalOptions = emptyObj) => {
      const { dispatch, getState } = store
      const cache = prop(cacheStoreKey, getState())
      const { [dataCacheKey]: cachedData, [paramsCacheKey]: cachedParams } = cache
      const currentCachedParams = cachedParams[cacheKey] || emptyArr
      const filterData = getDataFilter(params)
      const invalidateCache = contextLoaderFn[invalidateCacheSymbol]
      const cascade = contextLoaderFn[invalidateCascadeSymbol]
      const {
        onSuccess = (successMessage, params) => console.info(successMessage),
        onError = (errorMessage, catchedErr, params) => console.error(errorMessage, catchedErr),
      } = additionalOptions

      const loadFromContext = (key, params = emptyObj, refetchDeep = cascade && refetch) => {
        return getContextLoader(key)(params, refetchDeep)
      }

      // Get the required values from the provided params
      const providedRequiredParams = pipe(pick(allRequiredParams), reject(isNil))(params)
      // If not all the required params are provided, skip this request and just return an empty array
      if (requiredParams && values(providedRequiredParams).length < allRequiredParams.length) {
        // Show up a warning when trying to refetch the data without providing some of the required params
        if (refetch && !contextLoaderFn._invalidatedCache) {
          console.warn(
            `Some of the required params were not provided for ${cacheKey} loader, returning an empty array`,
          )
        }
        return emptyArr
      }

      const providedIndexedParams = pipe(
        pickAll(allIndexKeys),
        reject(either(isNil, equals(allKey))),
      )(params)

      try {
        contextLoaderFn[invalidateCacheSymbol] = false
        contextLoaderFn[invalidateCascadeSymbol] = refetchCascade

        if (!refetch && !invalidateCache) {
          // If the provided params are already cached
          if (find(equals(providedIndexedParams), currentCachedParams)) {
            // Return the cached data filtering by the provided params
            const cachedItems = filterData(cachedData)
            const mappedData = await memoizedDataMapper(cachedItems, params, loadFromContext)
            return sortWith(mappedData, params)
          }
        }
        // if refetch = true or no cached params have been found, fetch the items
        const items = await dataFetchFn(params, loadFromContext)

        // We can't rely on the server to index the data, as sometimes it simply doesn't return the
        // params used for the query, so we will add them to the items in order to be able to find them afterwards
        const itemsWithParams = arrayIfEmpty(
          map(mergeLeft(params), ensureArray(items)),
        )

        // Perfom the cache update operations
        if (invalidateCache || refetch) {
          dispatch(cacheActions.replaceAll({
            cacheKey,
            items: itemsWithParams,
            params,
          }))
        } else {
          dispatch(cacheActions.upsertAll({
            uniqueIdentifier,
            cacheKey,
            items: itemsWithParams,
            params: providedIndexedParams,
          }))
        }

        if (onSuccess) {
          const parsedSuccessMesssage = ensureFunction(fetchSuccessMessage)(params)
          await onSuccess(parsedSuccessMesssage, params)
        }
        const mappedData = await memoizedDataMapper(itemsWithParams, params, loadFromContext)
        return sortWith(mappedData, params)
      } catch (err) {
        if (onError) {
          const parsedErrorMesssage = ensureFunction(fetchErrorMessage)(err, params)
          await onError(parsedErrorMesssage, err, params)
        }
        return emptyArr
      }
    },
  )
  contextLoaderFn._invalidatedCache = true
  /**
   * Invalidate the current cache
   * Subsequent calls will reset current cache params and data
   * @function
   * @deprecated Use dispatch(cacheActions.clearCache(cacheKey)) instead
   */
  contextLoaderFn.invalidateCache = () => {
    contextLoaderFn._invalidatedCache = true
  }
  /**
   * Function to retrieve the current cacheKey
   * @function
   * @returns {string}
   */
  contextLoaderFn.cacheKey = cacheKey
  contextLoaderFn.dataMapper = memoizedDataMapper
  contextLoaderFn.getDataFilter = getDataFilter

  if (has(cacheKey, loaders)) {
    console.warn(`Context Loader function with key ${cacheKey} already exists`)
  }
  loaders = assoc(cacheKey, contextLoaderFn, loaders)
  return contextLoaderFn
}

export default createContextLoader
