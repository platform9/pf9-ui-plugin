import { allKey, defaultUniqueIdentifier } from 'app/constants'
import store from 'app/store'
import { cacheActions } from 'core/caching/cacheReducers'
import createSorter from 'core/helpers/createSorter'
import getDataSelector from 'core/utils/getDataSelector'
import moize from 'moize'
import {
  assoc,
  either,
  equals,
  has,
  isNil,
  map,
  mergeLeft,
  pick,
  pickAll,
  pipe,
  reject,
  values,
} from 'ramda'
import { createSelector } from 'reselect'
import { arrayIfEmpty, emptyArr, emptyObj, ensureArray } from 'utils/fp'
import { memoizePromise, uncamelizeString } from 'utils/misc'

let loaders = {}
export const getContextLoader = (key) => {
  return loaders[key]
}
export const invalidateLoadersCache = () => {
  Object.values(loaders).forEach((loader) => loader.invalidateCache())
}

export const getDefaultSelectorCreator = moize((selector) => {
  return () =>
    createSelector([selector, (_, params) => params], (items, params) => {
      return pipe(createSorter(params), arrayIfEmpty)(items)
    })
})

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
    indexBy = emptyArr,
    requiredParams = indexBy,
    fetchErrorMessage = (catchedErr, params) => `Unable to fetch ${entityName} items`,
    selector = getDataSelector(cacheKey, indexBy),
    selectorCreator = getDefaultSelectorCreator(selector),
    cache = true,
  } = options
  const allIndexKeys = indexBy ? ensureArray(indexBy) : emptyArr
  const allRequiredParams = requiredParams ? ensureArray(requiredParams) : emptyArr
  const invalidateCacheSymbol = Symbol('invalidateCache')

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
    async (params = emptyObj, refetch = contextLoaderFn[invalidateCacheSymbol]) => {
      const { dispatch } = store
      const invalidateCache = contextLoaderFn[invalidateCacheSymbol]
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

      contextLoaderFn[invalidateCacheSymbol] = false

      // if refetch = true or no cached params have been found, fetch the items
      const items = await dataFetchFn(params)

      // We can't rely on the server to index the data, as sometimes it simply doesn't return the
      // params used for the query, so we will add them to the items in order to be able to find them afterwards
      const itemsWithParams = arrayIfEmpty(
        map(mergeLeft(providedIndexedParams), ensureArray(items)),
      )

      // Perform the cache update operations
      if (!cache || invalidateCache || refetch) {
        dispatch(
          cacheActions.replaceAll({
            cacheKey,
            items: itemsWithParams,
            params: cache ? providedIndexedParams : null,
          }),
        )
      } else {
        dispatch(
          cacheActions.upsertAll({
            uniqueIdentifier,
            cacheKey,
            items: itemsWithParams,
            params: providedIndexedParams,
          }),
        )
      }
      return itemsWithParams
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
  contextLoaderFn.indexBy = allIndexKeys
  contextLoaderFn.cache = cache
  contextLoaderFn.fetchErrorMessage = fetchErrorMessage
  contextLoaderFn.selectorCreator = selectorCreator

  if (has(cacheKey, loaders)) {
    console.warn(`Context Loader function with key ${cacheKey} already exists`)
  }
  loaders = assoc(cacheKey, contextLoaderFn, loaders)
  return contextLoaderFn
}

export default createContextLoader
